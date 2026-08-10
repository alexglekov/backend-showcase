import { RedisService } from '@xyro/libs/redis';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { BetResultEnum } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/prisma';

type GlobalBetsStatistic = {
  countDailyClosedGames: number;
}

type QueryGlobalBetsStatisticData = {
  countDailyClosedGames: BigInt | null;
}

@Injectable()
export class GlobalBetsStatisticService implements OnModuleInit {
  private globalBetsStatisticCacheKey = `global-bets-statistic`;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService
  ) {}

  async onModuleInit() {
    await this.refreshGlobalBetsStatistic();
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async refreshGlobalBetsStatistic() {
    const [aggregatedData] = await this.prismaService.$queryRaw<[QueryGlobalBetsStatisticData]>`
      SELECT COUNT(DISTINCT "Bet"."gameId") as "countDailyClosedGames"
      FROM "Bet"
      WHERE
        "Bet"."result" IN (${BetResultEnum.WON}::"BetResultEnum", ${BetResultEnum.LOSS}::"BetResultEnum")
        AND "createdAt" > NOW() - INTERVAL '24 hours';
    `;

    await this.redisService.set<GlobalBetsStatistic>(
      this.globalBetsStatisticCacheKey,
      {
        countDailyClosedGames: Number(aggregatedData.countDailyClosedGames || 0),
      },
    );
  }

  async getGlobalBetsStatistic() {
    const cachedData = await this.redisService.get<GlobalBetsStatistic>(
      this.globalBetsStatisticCacheKey
    );

    if (!cachedData) {
      throw new InternalServerErrorException(`UnexpectedError: total platform statistic not calculated`);
    }

    return cachedData;
  }
}