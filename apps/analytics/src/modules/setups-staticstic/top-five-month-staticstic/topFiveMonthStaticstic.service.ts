import { Injectable } from '@nestjs/common';
import { RedisService } from '@xyro/libs/redis';
import { Decimal } from 'decimal.js';
import { BetResultEnum } from '@prisma/client';
import { DateTime } from 'luxon';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PrismaService } from '.././../../infrastructure/prisma';

interface GetTopMonthSetupersParams {
  userId?: string
}

interface GetTopMonthSetupersResult {
  topByWinrate: {
    position: number;
    winratePercentage: number;
    userId: string;
  }[];
  topByUsers: {
    position: number;
    profit: number;
    userId: string;
  }[];
}

const TOP_PLAYERS_TTL_IN_SECONDS = 10;
const DEFAULT_SUB_CACHE_KEY = 'general';

@Injectable()
export class TopFiveMonthSetupersStaticsticService {
  constructor(
    private readonly redisService: RedisService,
    private readonly prismaService: PrismaService,
  ) {}

  async onModuleInit() {
    await this.refreshGlobalMonthSetupers();
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async refreshGlobalMonthSetupers() {
    const result = await this.calculateMonthSetupers();

    await this.redisService.set<GetTopMonthSetupersResult>(
      this.getCacheKey(this.getCacheKey()),
      result,
    );
  }

  public async getTopMonthSetupers(params: GetTopMonthSetupersParams): Promise<GetTopMonthSetupersResult> {
    const cachedData = await this.redisService.get<GetTopMonthSetupersResult>(
      this.getCacheKey(params.userId)
    );

    if (cachedData) return cachedData;

    const result = await this.calculateMonthSetupers(params.userId);

    await this.redisService.set<GetTopMonthSetupersResult>(
      this.getCacheKey(params.userId),
      result,
      {
        expiresInSeconds: TOP_PLAYERS_TTL_IN_SECONDS
      },
    );

    return result;
  }

  private async calculateMonthSetupers(userId?: string): Promise<GetTopMonthSetupersResult> {
    const [topByWinrate, topByUsers] = await Promise.all([
      this.getTopMonthSetupersByWinrate(userId),
      this.getTopMonthSetupersByUser(userId),
    ]);

    const result = { topByWinrate, topByUsers };

    return result;
  }

  public async getTopMonthSetupersByWinrate(
    userId?: string,
  ): Promise<GetTopMonthSetupersResult['topByWinrate']> {
    const today = new Date();

    const setupBets = await this.prismaService.betSetup.findMany({
      where: {
        createdAt: {
          gte: DateTime.fromJSDate(today).minus({ months: 1 }).toJSDate(),
        },
      },
      include: {
        owner: true,
      },
    });

    if (!setupBets) {
      return [];
    }

    const groupedBets = setupBets.reduce((acc, bet) => {
      const key = bet.ownerId;
      acc[key] = acc[key] || {
        wins: 0,
        bets: 0,
      };

      if (bet.result === BetResultEnum.WON) {
        acc[key].wins++;
      }

      acc[key].bets++;

      return acc;
    }, {} as Record<string, {
      wins: number;
      bets: number;
    }>);

    const winrates = Object.keys(groupedBets).map((ownerId, index) => {
      const { wins, bets } = groupedBets[ownerId];
      const winrate = Number(((wins / (bets || 1)) * 100).toFixed(1));

      return {
        position: index + 1,
        winratePercentage: winrate,
        userId: ownerId,
      };
    });

    if (userId) {
      const myWinrateIndex = winrates.findIndex((winrate) => winrate.userId === userId);

      if (myWinrateIndex < 5) return winrates.slice(0, 5);

      const resultWinrates = winrates.slice(0, 4);

      resultWinrates.push(winrates[myWinrateIndex]);

      return resultWinrates;
    }

    return winrates.slice(0, 5);
  }

  public async getTopMonthSetupersByUser(
    userId?: string,
  ): Promise<GetTopMonthSetupersResult['topByUsers']> {
    const today = new Date();

    const allUserStats = await this.prismaService.betSetup.groupBy({
      by: ['ownerId'],
      _count: {
        createdAt: true,
        outcome: true,
      },
      _sum: {
        outcome: true,
      },
      where: {
        createdAt: {
          gte: DateTime.fromJSDate(today).minus({ months: 1 }).toJSDate(),
        },
      },
    });

    if (!allUserStats) {
      return [];
    }

    const sortedUsersByOutcome = allUserStats.sort((a, b) =>
      new Decimal(b._sum.outcome || 0)!.cmp(new Decimal(a._sum.outcome || 0)),
    );

    const winrates = sortedUsersByOutcome.map((userStats, index) => {
      const profit = Number(userStats._sum?.outcome || 0);
      return {
        position: index + 1,
        userId: userStats.ownerId,
        profit
      };
    });

    if (userId) {
      const myWinrateIndex = winrates.findIndex((winrate) => winrate.userId === userId);

      if (myWinrateIndex < 5) return winrates.slice(0, 5);

      const resultWinrates = winrates.slice(0, 4);

      resultWinrates.push(winrates[myWinrateIndex]);

      return resultWinrates;
    }

    return winrates.slice(0, 5);

  }

  private getCacheKey(userId?: string) {
    return `topMonthSetupers:${userId || DEFAULT_SUB_CACHE_KEY}`
  }
}
