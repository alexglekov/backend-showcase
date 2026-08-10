import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from '@xyro/libs/redis';
import { GameStateEnum } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DateTime } from 'luxon';

import { PrismaService } from '../../../infrastructure/prisma';

interface GetTodaysLeadersParams {
  userId?: string;
}

interface TopByData {
  betId: string;
}

interface GetTodaysLeadersResult {
  topByRoi: TopByData[];
  topByPnl: TopByData[];
  userPositionRoi?: number;
  userPositionPnl?: number;
}

const TOP_PLAYERS_TTL_IN_SECONDS = 10;
const COUNT_TOP_PLAYERS = 5;
const DEFAULT_SUB_CACHE_KEY = 'general';

@Injectable()
export class TodayX1000LeadersStatisticService implements OnModuleInit {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService
  ) {}

  async onModuleInit() {
    await this.refreshGlobalTodaysLeaders();
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async refreshGlobalTodaysLeaders() {
    const result = await this.calculateTodaysLeaders();

    await this.redisService.set<GetTodaysLeadersResult>(
      this.getCacheKey(this.getCacheKey()),
      result,
    );
  }

  public async getTodaysLeaders(params: GetTodaysLeadersParams): Promise<GetTodaysLeadersResult> {
    const cachedData = await this.redisService.get<GetTodaysLeadersResult>(
      this.getCacheKey(params.userId)
    );

    if (cachedData) return cachedData;

    const result = await this.calculateTodaysLeaders(params.userId);

    await this.redisService.set<GetTodaysLeadersResult>(
      this.getCacheKey(params.userId),
      result,
      {
        expiresInSeconds: TOP_PLAYERS_TTL_IN_SECONDS
      },
    );

    return result;
  }

  private async calculateTodaysLeaders(userId?: string) {
    const today = new Date();

    const [
      sortedByPnl,
      sortedByRoi,
    ] = await Promise.all([
      this.prismaService.betX1000.findMany({
        where: {
          createdAt: {
            gte: DateTime.fromJSDate(today).minus({ hours: 24 }).toJSDate(),
          },
          game: {
            state: {
              in: [GameStateEnum.CLOSE, GameStateEnum.PENDING],
            },
          },
        },
        orderBy: {
          pnl: 'desc',
        },
        distinct: ['ownerId'],
        include: {
          owner: true,
        },
      }),
      this.prismaService.betX1000.findMany({
        where: {
          createdAt: {
            gte: DateTime.fromJSDate(today).minus({ hours: 24 }).toJSDate(),
          },
          game: {
            state: {
              in: [GameStateEnum.CLOSE, GameStateEnum.PENDING],
            },
          },
        },
        orderBy: {
          roi: 'desc',
        },
        distinct: ['ownerId'],
        include: {
          owner: true,
        },
      })
    ]);

    const topByRoi = sortedByRoi.slice(0, COUNT_TOP_PLAYERS);
    const topByPnl = sortedByPnl.slice(0, COUNT_TOP_PLAYERS);

    const userPositionRoi = sortedByRoi.findIndex((bet) => bet.ownerId === userId);
    const userPositionPnl = sortedByPnl.findIndex((bet) => bet.ownerId === userId);

    if (userPositionRoi !== -1 && userPositionRoi >= COUNT_TOP_PLAYERS) {
      topByRoi.pop();
      topByRoi.push(sortedByRoi[userPositionRoi]);
    }

    if (userPositionPnl !== -1 && userPositionPnl >= COUNT_TOP_PLAYERS) {
      topByPnl.pop();
      topByPnl.push(sortedByPnl[userPositionPnl]);
    }

    const result: GetTodaysLeadersResult = {
      topByRoi: topByRoi.map((bet) => ({ betId: bet.id })),
      topByPnl: topByPnl.map((bet) => ({ betId: bet.id })),
      userPositionRoi: userPositionRoi === -1 ? undefined : userPositionRoi,
      userPositionPnl: userPositionPnl === -1 ? undefined : userPositionPnl,
    };

    return result;
  }

  private getCacheKey(userId?: string) {
    return `topTodaysX1000PlayersBy:${userId || DEFAULT_SUB_CACHE_KEY}`;
  }
}

// TODO: BE-81
// SELECT * FROM (
//   SELECT
//       "ownerId",
//       "pnl",
//       RANK () OVER (
//           ORDER BY pnl DESC
//       ) as positionByPnl
//   FROM (
//       SELECT
//           "ownerId",
//           MAX("pnl") as "pnl"
//       FROM "BetX1000"
//       WHERE
//           pnl is not NULL AND "createdAt" < (CURRENT_DATE - INTERVAL '1 day')::timestamp
//       GROUP BY "ownerId"
//    ) "Bets"
//   ORDER BY "ownerId", pnl DESC
// ) "TopByPnl"
// WHERE "TopByPnl".positionByPnl < 6 OR "ownerId" = ($1)::text
// ORDER BY "TopByPnl".positionByPnl;

