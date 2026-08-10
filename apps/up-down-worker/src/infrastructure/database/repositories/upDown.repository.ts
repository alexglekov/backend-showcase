import { Injectable } from '@nestjs/common';
import { BetResultEnum, GameStateEnum, GameTypeEnum, GameUpDown, Prisma } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { ConfigService } from '@nestjs/config';

import { PrismaService, DBTransaction } from '../prisma';
import { Config } from '../../config';

interface MoveGameToPendingStateParams {
  gameId: string;
  isUp: boolean | null;
  endPrice: Decimal | null;
}

interface MoveGameToInProgressStateParams {
  gameId: string;
  startPrice?: Decimal;
}

interface MoveGameToCloseStateParams {
  gameId: string;
  transaction?: DBTransaction;
}

interface GetGameByIdParams {
  gameId: string;
}

interface MoveBetToCloseStateParams {
  id: string;
  result: BetResultEnum;
  fee: Decimal | null;
  pnl: Decimal | null;
  outcome: Decimal | null;
  multiplier: number;
  transaction?: DBTransaction;
}

interface CreateGameParams {
  assetId: string;
  timeframe: number;
  startAt: Date;
  endAt: Date;
  stopBetsAt: Date;
}

@Injectable()
export class UpDownGameRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService<Config>,
  ) {}

  async startTransaction<Result>(callback: (transaction: DBTransaction) => Promise<Result>): Promise<Result> {
    return this.prismaService.$transaction(callback);
  }

  async getActiveGames() {
    return this.prismaService.gameUpDown.findMany({
      where: {
        state: {
          in: [GameStateEnum.OPEN, GameStateEnum.INPROGRESS],
        },
      },
    });
  }

  async createGame(params: CreateGameParams, transaction?: DBTransaction): Promise<GameUpDown> {
    const prismaClient = transaction ?? this.prismaService;

    const { assetId, timeframe, startAt, endAt, stopBetsAt } = params;

    const createdGame = await prismaClient.gameUpDown.create({
      data: {
        state: GameStateEnum.OPEN,
        type: GameTypeEnum.UPDOWN,
        assetId,
        startPrice: null,
        endPrice: null,
        timeframe,
        startAt: startAt,
        endAt: endAt,
        stopBetsAt: stopBetsAt,
        data: {},
        isUp: null,
        pools: {},
      },
    });

    return createdGame;
  }

  async getGameById(params: GetGameByIdParams) {
    const { gameId } = params;

    return this.prismaService.gameUpDown.findFirst({
      where: {
        id: gameId,
      },
      include: {
        bets: true,
      }
    });
  }

  async moveGameToCloseState(params: MoveGameToCloseStateParams) {
    const { gameId, transaction } = params;

    const prismaClient = transaction ?? this.prismaService;

    return prismaClient.gameUpDown.update({
      data: {
        state: GameStateEnum.CLOSE,
      },
      where: {
        id: gameId,
        state: GameStateEnum.PENDING,
      },
    });
  }

  async moveBetToCloseState(params: MoveBetToCloseStateParams) {
    const { id, transaction, multiplier, result, fee, outcome, pnl } = params;

    const prismaClient = transaction ?? this.prismaService;

    return prismaClient.betUpDown.update({
      data: {
        multiplier,
        result,
        fee,
        outcome,
        pnl,
      },
      where: {
        id,
        result: BetResultEnum.PENDING,
      },
    });
  }

  async moveGameToInProgressState(params: MoveGameToInProgressStateParams) {
    const { gameId, startPrice } = params;
    const { dbTransactionTimeout } = this.configService.get('app');

    const { updatedGame } = await this.prismaService.$transaction(
      async (dbTransaction: DBTransaction) => {
        await dbTransaction.betUpDown.updateMany({
          where: {
            gameId,
            result: BetResultEnum.OPEN,
          },
          data: {
            result: BetResultEnum.INPROGRESS,
          },
        });

        const updatedGame = await dbTransaction.gameUpDown.update({
          where: {
            id: gameId,
            state: GameStateEnum.OPEN,
          },
          data: {
            state: GameStateEnum.INPROGRESS,
            startPrice,
          },
        });

        return {
          updatedGame
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: dbTransactionTimeout,
      }
    );

    return updatedGame;
  }

  async moveGameToPendingState(params: MoveGameToPendingStateParams) {
    const { endPrice, gameId, isUp } = params;
    const { dbTransactionTimeout } = this.configService.get('app');

    const { updatedGame } = await this.prismaService.$transaction(
      async (dbTransaction: DBTransaction) => {
        await dbTransaction.betUpDown.updateMany({
          where: {
            gameId,
            result: {
              in: [BetResultEnum.INPROGRESS, BetResultEnum.OPEN],
            }
          },
          data: {
            result: BetResultEnum.PENDING,
          },
        });

        const updatedGame = await dbTransaction.gameUpDown.update({
          where: {
            id: gameId,
          },
          data: {
            isUp,
            state: GameStateEnum.PENDING,
            endPrice,
          },
        });

        return {
          updatedGame
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: dbTransactionTimeout,
      }
    );

    return updatedGame;
  }

  isGameOpen(gameState: string) {
    return gameState === GameStateEnum.OPEN;
  }

  isGameInProgress(gameState: string) {
    return gameState === GameStateEnum.INPROGRESS;
  }

  isGameClose(gameState: string) {
    return gameState === GameStateEnum.CLOSE;
  }

  isGameInPending(gameState: string) {
    return gameState === GameStateEnum.PENDING;
  }
}