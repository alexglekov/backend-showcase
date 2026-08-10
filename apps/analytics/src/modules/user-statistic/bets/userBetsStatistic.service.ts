import { Injectable } from '@nestjs/common';
import { BetResultEnum } from '@prisma/client';
import { RedisService } from '@xyro/libs/redis';
import { Decimal } from 'decimal.js';

import { PrismaService } from '../../../infrastructure/prisma';

type GetUserBetsStatisticParams = {
  userId: string;
};

type GetUserBetsStatisticResult = {
  totalBets: number;
  totalBetsAmount: number;
  // activeBets: number;
  // closeBets: number;
  winrate: number;
  largestWin: number;
};

type UserWonBetsStatisticQueryResult = {
  totalWons: BigInt;
  largestOutcome: BigInt | null;
}

type UserBetsStatisticQueryResult = {
  totalBets: BigInt;
  totalBetsAmount: BigInt;
}

const USER_BETS_STATISTIC_KEY = 'userBetsStatisticCacheKey';
const USER_BETS_STATISTIC_TTL_SECONDS = 60 * 5; // 5 minutes

@Injectable()
export class UserBetsStatisticService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService
  ) {}

  public async getUserBetsStatistic(
    params: GetUserBetsStatisticParams,
  ): Promise<GetUserBetsStatisticResult> {
    const userBetsStatisticCache = await this.redisService.get<GetUserBetsStatisticResult>(
      this.getUserBetsStatisticCacheKey(params.userId)
    );

    if (userBetsStatisticCache) return userBetsStatisticCache;

    const [[betsStatistic], [wonBetsStatistic]] = await Promise.all([
      this.prismaService.$queryRawUnsafe<[UserBetsStatisticQueryResult]>(
        `SELECT COUNT(*) as "totalBets", SUM("Bet".amount) as "totalBetsAmount"
         FROM "Bet"
         WHERE "result"::text IN ($1, $2) AND "ownerId" = ($3)::uuid;
        `,
        BetResultEnum.WON,
        BetResultEnum.LOSS,
        params.userId,
      ),
      this.prismaService.$queryRawUnsafe<[UserWonBetsStatisticQueryResult]>(
        `SELECT COUNT(*) as "totalWons", MAX("Bet".pnl) as "largestOutcome"
         FROM "Bet"
         WHERE "result"::text = $1 AND "ownerId" = ($2)::uuid;
        `,
        BetResultEnum.WON,
        params.userId,
      ),
    ]);

    // TODO: in another query?
    // const activeBets = await this.prismaService.bet.count({
    //   where: {
    //     ownerId: params.userId,
    //     result: { in: [BetResultEnum.OPEN, BetResultEnum.INPROGRESS] },
    //   },
    // });

    // const closeBets = await this.prismaService.bet.count({
    //   where: {
    //     ownerId: params.userId,
    //     result: {
    //       in: [
    //         BetResultEnum.WON,
    //         BetResultEnum.LOSS,
    //         BetResultEnum.REJECT,
    //         BetResultEnum.PENDING,
    //       ],
    //     },
    //   },
    // });

    const winrate = Number(
      new Decimal(Number(wonBetsStatistic.totalWons || 0))
      .div(Number(betsStatistic.totalBets) || 1)
      .mul(100)
      .toFixed(1)
    );

    const result: GetUserBetsStatisticResult = {
      totalBets: Number(betsStatistic.totalBets),
      // activeBets: Number(activeBets),
      // closeBets: Number(closeBets),
      winrate: Number(winrate),
      totalBetsAmount: Number(betsStatistic.totalBetsAmount),
      largestWin: Number(wonBetsStatistic.largestOutcome || 0),
    };

    await this.redisService.set<GetUserBetsStatisticResult>(
      this.getUserBetsStatisticCacheKey(params.userId),
      result,
      {
        expiresInSeconds: USER_BETS_STATISTIC_TTL_SECONDS,
      }
    );

    return result;
  }

  getUserBetsStatisticCacheKey(userId: string): string {
    return `${USER_BETS_STATISTIC_KEY}:${userId}`;
  }
}