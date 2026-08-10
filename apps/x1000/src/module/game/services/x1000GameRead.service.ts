import { Injectable } from '@nestjs/common';
import {
  BetResultEnum,
  BetX1000,
  GameStateEnum,
  GameX1000,
  User,
} from '@prisma/client';

import { PrismaService } from '../../../infrastructure/prisma';
import { RedisService } from '@xyro/libs/redis';
import { DateTime } from 'luxon';

type OrderBy = 'asc' | 'desc';

type GetUserGamesParams = {
  userId: string;
  isActive?: boolean;
  skip?: number;
  take?: number;
  pnl?: OrderBy;
  roi?: OrderBy;
  isUp?: OrderBy;
  endPrice?: OrderBy;
  multiplier?: OrderBy;
  burnPrice?: OrderBy;
  startPrice?: OrderBy;
  amount?: OrderBy;
};

type GetX1000GamesInput = {
  skip?: number;
  take?: number;
  pnl?: OrderBy;
  roi?: OrderBy;
  isUp?: OrderBy;
  endPrice?: OrderBy;
  multiplier?: OrderBy;
  burnPrice?: OrderBy;
  startPrice?: OrderBy;
  amount?: OrderBy;
};

type GetPaginatedParams = {
  skip?: number;
  take?: number;
};

export interface Leaders {
  topByRoi: BetX1000[];
  topByPnl: BetX1000[];
  userPositionRoi?: number;
  userPositionPnl?: number;
}

const TOP_PLAYERS_EXPIRED = 10;

@Injectable()
export class X1000GameReadService {
  constructor(
    private readonly redis: RedisService,
    private readonly prismaService: PrismaService
  ) {}

  public async getUserGamesCounters(userId: string): Promise<{
    active: number;
    closed: number;
  }> {
    const active = await this.prismaService.gameX1000.count({
      where: { state: GameStateEnum.INPROGRESS, ownerId: userId },
    });
    const closed = await this.prismaService.gameX1000.count({
      where: {
        state: { in: [GameStateEnum.CLOSE, GameStateEnum.PENDING] },
        ownerId: userId,
      },
    });
    return {
      active,
      closed,
    };
  }

  public async getGameById(gameId: string): Promise<GameX1000 | null> {
    const game = await this.prismaService.gameX1000.findFirst({
      where: {
        id: gameId,
      },
    });

    return game;
  }

  public async getUserGames(params: GetUserGamesParams): Promise<GameX1000[]> {
    const bets = await this.prismaService.betX1000.findMany({
      where: {
        game: {
          state:
            typeof params.isActive === 'boolean'
              ? params.isActive
                ? GameStateEnum.INPROGRESS
                : {
                    in: [GameStateEnum.CLOSE, GameStateEnum.PENDING],
                  }
              : undefined,
          ownerId: params.userId,
        },
      },
      include: {
        game: true,
      },
      orderBy: {
        endPrice: params.endPrice,
        startPrice: params.startPrice,
        pnl: params.pnl,
        roi: params.roi,
        isUp: params.isUp,
        multiplier: params.multiplier,
        burnPrice: params.burnPrice,
        amount: params.amount,
        createdAt: 'desc',
      },
      skip: params.skip,
      take: params.take,
    });

    return bets.map((bet) => ({ ...bet.game, bets: [bet] }));
  }

  public async getX1000Games(params: GetX1000GamesInput): Promise<GameX1000[]> {
    const bets = await this.prismaService.betX1000.findMany({
      where: {
        result: {
          in: [BetResultEnum.LOSS, BetResultEnum.WON],
        },
      },
      include: {
        game: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      skip: params.skip,
      take: params.take,
    });

    return bets.map((bet) => ({ ...bet.game, bets: [bet] }));
  }

  public async getLatestWinningGames(params: GetPaginatedParams) {
    const latestWinningBets = await this.prismaService.gameX1000.findMany({
      where: {
        bets: {
          every: {
            result: BetResultEnum.WON,
          },
        },
      },
      orderBy: {
        endAt: 'desc',
      },
      include: {
        owner: true,
      },
      take: params.take,
      skip: params.skip,
    });

    return latestWinningBets;
  }

  public async getTodaysLeaders(userId: string): Promise<Leaders> {
    const cacheKey = `topTodaysX1000PlayersBy:${userId}`;
    const cachedData = await this.redis.get<Leaders>(cacheKey);

    if (cachedData) {
      return cachedData;
    } else {
      const today = new Date();

      const sortedByPnl = await this.prismaService.betX1000.findMany({
        where: {
          createdAt: {
            gte: DateTime.fromJSDate(today).minus({ days: 1 }).toJSDate(),
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
      });

      const sortedByRoi = await this.prismaService.betX1000.findMany({
        where: {
          createdAt: {
            gte: DateTime.fromJSDate(today).minus({ days: 1 }).toJSDate(),
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
      });

      const userPositionRoi = userId
        ? sortedByRoi.findIndex((bet) => bet.ownerId === userId)
        : undefined;
      const userPositionPnl = userId
        ? sortedByPnl.findIndex((bet) => bet.ownerId === userId)
        : undefined;
      const topByRoi = sortedByRoi.slice(0, 5);
      const topByPnl = sortedByPnl.slice(0, 5);

      if (
        userPositionPnl !== undefined &&
        topByRoi.length === 5 &&
        !topByRoi.includes(sortedByRoi[userPositionRoi!])
      ) {
        topByRoi[4] = sortedByRoi[userPositionRoi!];
      }

      if (
        userPositionPnl !== undefined &&
        topByPnl.length === 5 &&
        !topByPnl.includes(sortedByPnl[userPositionPnl])
      ) {
        topByPnl[4] = sortedByPnl[userPositionPnl];
      }
      const dataToCache = {
        topByRoi,
        topByPnl,
        userPositionRoi,
        userPositionPnl,
      };

      await this.redis.set(cacheKey, dataToCache, {
        expiresInSeconds: TOP_PLAYERS_EXPIRED,
      });

      return {
        topByRoi,
        topByPnl,
        userPositionRoi,
        userPositionPnl,
      };
    }
  }
}
