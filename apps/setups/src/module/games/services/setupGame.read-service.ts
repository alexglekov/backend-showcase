import { BetResultEnum, GameStateEnum, Prisma } from '@prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';

import { TSetupGamePoolsInfo, TSetupGameWithPoolsEnfo } from './typings';
import { PrismaService } from '../../../infrastructure/prisma';
import { SetupGameGraphQLOrphanEntity } from '@xyro/contracts/setups';

type TSetupBetsGrouppedByGame = {
  gameId: string;
  isUp: boolean | null;
  _sum: {
    amount: Decimal | null;
  };
  _count: number;
}

type TGetGamesByParams = {
  ownerId?: string;
  isActive?: boolean;
  skip: number;
  take: number;
}

@Injectable()
export class SetupGameReadService {
  constructor(private readonly prismaService: PrismaService) {}

  async resolveReferences(references: SetupGameGraphQLOrphanEntity[]) {
    const games = await this.prismaService.gameSetup.findMany({
      where: {
        id: {
          in: references.map((reference) => reference.id),
        }
      },
    });

    const setupGamesPoolsInfoMapper = await this.getSetupGamePoolInfoBatch(
      games.map((game) => game.id),
    );

    return games.map((game) => {
      const { id } = game;

      const setupGamePoolsInfo = setupGamesPoolsInfoMapper.get(id) ?? this.getSetupGameEmptyPoolsInfo();

      return { ...game, ...setupGamePoolsInfo };
    });
  }

  public async getGameById(gameId: string): Promise<TSetupGameWithPoolsEnfo> {
    const game = await this.prismaService.gameSetup.findFirst({
      where: { id: gameId },
      include: {
        bets: true,
      },
    });

    if (!game) {
      throw new BadRequestException(`Setup game not found.`);
    }

    const setupGamesPoolsInfoMapper = await this.getSetupGamePoolInfoBatch([gameId]);
    const setupGamePoolsInfo = setupGamesPoolsInfoMapper.get(gameId) ?? this.getSetupGameEmptyPoolsInfo();

    return { ...game, ...setupGamePoolsInfo };
  }

  public async getGamesBy(params: TGetGamesByParams): Promise<TSetupGameWithPoolsEnfo[]> {
    const where: Prisma.GameSetupWhereInput = {};
    const orderBy: Prisma.GameSetupOrderByWithRelationInput = {};

    if (params.ownerId) {
      where.OR = [{ ownerId: params.ownerId }];
    }

    if (typeof params.isActive === 'boolean') {
      where.state = {
        in: params.isActive
          ? [GameStateEnum.INPROGRESS, GameStateEnum.OPEN]
          : [GameStateEnum.CLOSE, GameStateEnum.PENDING],
      };
    }

    orderBy.createdAt = 'desc';

    const games = await this.prismaService.gameSetup.findMany({
      where,
      orderBy,
      skip: params.skip,
      take: params.take,
    });

    const setupGamesPoolsInfoMapper = await this.getSetupGamePoolInfoBatch(
      games.map((game) => game.id),
    );

    return games.map((game) => {
      const { id } = game;

      const setupGamePoolsInfo = setupGamesPoolsInfoMapper.get(id) ?? this.getSetupGameEmptyPoolsInfo();

      return { ...game, ...setupGamePoolsInfo };
    });
  }

  private getSetupGameEmptyPoolsInfo(): TSetupGamePoolsInfo {
    return {
      takeProfitPool: {
        amount: 0,
        count: 0,
        multiplier: 0,
      },
      stopLossPool: {
        amount: 0,
        count: 0,
        multiplier: 0,
      }
    };
  }

  private async getSetupGamePoolInfoBatch(gamesIds: string[]) {
    const gamesPoolsInfo = await this.prismaService.betSetup.groupBy({
      _count: true,
      _sum: {
        amount: true,
      },
      by: ['gameId', 'isUp'],
      where: {
        gameId: {
          in: gamesIds,
        }
      }
    });

    return this.mapToSetupPoolsInfo(gamesPoolsInfo);
  }

  private mapToSetupPoolsInfo(setupBetsGrouppedByGame: TSetupBetsGrouppedByGame[]) {
    const mapper = new Map<string, TSetupGamePoolsInfo>();

    setupBetsGrouppedByGame.forEach((value) => {
      const { _count, _sum, gameId, isUp } = value;

      const poolsInfo = mapper.get(gameId) ?? this.getSetupGameEmptyPoolsInfo();

      const { stopLossPool, takeProfitPool } = poolsInfo;

      if (isUp) {
        takeProfitPool.amount = Number(_sum.amount ?? 0);
        takeProfitPool.count = _count;
      } else {
        stopLossPool.amount = Number(_sum.amount ?? 0);
        stopLossPool.count = _count;
      }

      takeProfitPool.multiplier = stopLossPool.amount / (takeProfitPool.amount || 1);
      stopLossPool.multiplier = takeProfitPool.amount / (stopLossPool.amount || 1);

      mapper.set(gameId, poolsInfo);
    });

    return mapper;
  }

  async getSetupGamesCount(userId: string) {
    const betsGroupByResult = await this.prismaService.betSetup.groupBy({
      _count: true,
      by: 'result',
      where: {
        ownerId: userId,
      }
    })

    let activeGamesCount = 0;
    let closeGamesCount = 0;

    const activeGamesResults: BetResultEnum[] = [
      BetResultEnum.OPEN,
      BetResultEnum.INPROGRESS
    ];

    betsGroupByResult.forEach((value) => {
      const { _count, result } = value;

      if (activeGamesResults.includes(result)) {
        activeGamesCount += _count ?? 0;
      } else {
        closeGamesCount += _count ?? 0;
      }
    })

    return { activeGamesCount, closeGamesCount };
  }
}
