import { BadRequestException, Injectable } from '@nestjs/common';
import { Bet } from '@prisma/client';
import { DateTime } from 'luxon';
import { RedisService } from '@xyro/libs/redis';

import { PrismaService } from '../../../infrastructure/prisma';

export enum WinrateDiagramSupportedTime {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  TREEMONTH = 'TREEMONTH',
  YEAR = 'YEAR',
}

enum BetsTypesEnum {
  x1000 = 'betX1000',
  setup = 'betSetup',
  bullsEye = 'betBullseye',
  upDown = 'betUpDown',
  oneVsOne = 'bet1vs1',
  average = 'bet',
}

type WinrateDiagramItem = {
  intervals: Date;
  winrate: number;
};

type GamesWinrateDiagramResult = {
  upDown: WinrateDiagramItem[];
  setup: WinrateDiagramItem[];
  bullsEye: WinrateDiagramItem[];
  x1000: WinrateDiagramItem[];
  oneVsOne: WinrateDiagramItem[];
  average: WinrateDiagramItem[];
};

type GetWinrateDiagramForGameTypeParams = {
  betType: BetsTypesEnum;
} & GetWinrateDiagramParams;

type GetWinrateDiagramParams = {
  userId: string;
  period: WinrateDiagramSupportedTime;
  intervals: number;
};

const USER_WINRATE_HISTORY_KEY = 'userWinrateHistory';
const USER_WINRATE_HISTORY_TTL_SECONDS = 60 * 3;

@Injectable()
export class UserWinrateHistoryService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService
  ) {}

  public async getGamesWinrateDiagram(
    params: GetWinrateDiagramParams,
  ): Promise<GamesWinrateDiagramResult> {
    const winrateHistoryCache = await this.redisService.get<GamesWinrateDiagramResult>(
      this.getUserWinrateHistoryCacheKey(params.userId, params.period)
    );

    if (winrateHistoryCache) return winrateHistoryCache;

    const gamesWinrateDiagramPromises: Promise<WinrateDiagramItem[]>[] = [];

    const betTypes = Object.values(BetsTypesEnum);

    for (const betType of betTypes) {
      const promise = this.getWinrateDiagramForGameType({
        userId: params.userId,
        period: params.period,
        intervals: params.intervals,
        betType,
      });
      gamesWinrateDiagramPromises.push(promise);
    }

    const [x1000, setup, bullsEye, upDown, oneVsOne, average] =
      await Promise.all(gamesWinrateDiagramPromises);


    await this.redisService.set<GamesWinrateDiagramResult>(
      this.getUserWinrateHistoryCacheKey(params.userId, params.period),
      {
        x1000, setup, bullsEye, upDown, oneVsOne, average
      },
      {
        expiresInSeconds: USER_WINRATE_HISTORY_TTL_SECONDS,
      }
    )

    return { x1000, setup, bullsEye, upDown, oneVsOne, average };
  }

  public async getWinrateDiagramForGameType(
    params: GetWinrateDiagramForGameTypeParams,
  ): Promise<WinrateDiagramItem[]> {
    const bets: Pick<Bet, 'pnl' | 'createdAt'>[] = await (this.prismaService[params.betType] as any).findMany({
      where: {
        ownerId: params.userId,
        createdAt: {
          gte: this.getStartDate(params.period).toJSDate(),
        },
      },
      select: {
        createdAt: true,
        pnl: true,
      }
    });

    const intervalDuration = this.getIntervalDuration(
      params.period,
      params.intervals,
    );
    const startDate = this.getStartDate(params.period);

    const intervals: WinrateDiagramItem[] = Array.from(
      { length: params.intervals },
      (_, index) => {
        const startInterval = startDate.plus({
          hours: index * intervalDuration,
        });
        const endInterval = startInterval.plus({ hours: intervalDuration });

        const betsInInterval = bets.filter(
          (bet) => bet.createdAt < endInterval.toJSDate(),
        );

        let totalWins = 0;
        let totalBets = 0;

        for (const bet of betsInInterval) {
          totalBets += 1;
          if (Number(bet.pnl) > 0) {
            totalWins += 1;
          }
        }

        const winrate = totalBets === 0 ? 0 : (totalWins / totalBets) * 100;

        return {
          intervals: startInterval.toJSDate(),
          winrate,
        };
      },
    );

    return intervals;
  }

  getUserWinrateHistoryCacheKey(userId: string, period: WinrateDiagramSupportedTime) {
    return `${USER_WINRATE_HISTORY_KEY}:${userId}:${period}`
  }

  getStartDate(params: WinrateDiagramSupportedTime): DateTime {
    const now = DateTime.local();
  
    switch (params) {
      case WinrateDiagramSupportedTime.DAY:
        return now.minus({ days: 1 });
      case WinrateDiagramSupportedTime.WEEK:
        return now.minus({ weeks: 1 });
      case WinrateDiagramSupportedTime.MONTH:
        return now.minus({ months: 1 });
      case WinrateDiagramSupportedTime.TREEMONTH:
        return now.minus({ months: 3 });
      case WinrateDiagramSupportedTime.YEAR:
        return now.minus({ years: 1 });
      default:
        throw new BadRequestException('Unsupported time interval');
    }
  }
  
  getIntervalDuration(
    params: WinrateDiagramSupportedTime,
    interavals: number,
  ): number {
    switch (params) {
      case WinrateDiagramSupportedTime.DAY:
        return 24 / interavals;
      case WinrateDiagramSupportedTime.WEEK:
        return (7 * 24) / interavals;
      case WinrateDiagramSupportedTime.MONTH:
        return (30 * 24) / interavals;
      case WinrateDiagramSupportedTime.TREEMONTH:
        return (3 * 30 * 24) / interavals;
      case WinrateDiagramSupportedTime.YEAR:
        return (365 * 24) / interavals;
      default:
        throw new BadRequestException('Unsupported time interval');
    }
  }
}