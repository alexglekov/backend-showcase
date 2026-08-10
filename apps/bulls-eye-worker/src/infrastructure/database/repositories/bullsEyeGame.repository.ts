import { Injectable } from '@nestjs/common';
import { BetResultEnum, GameBullseye, GameStateEnum, GameTypeEnum, Prisma } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { ConfigService } from '@nestjs/config';

import { PrismaService, DBTransaction } from '../prisma';
import { Config } from '../../config';

interface MoveGameToPendingStateParams {
  gameId: string;
  endPrice: Decimal | null;
}

interface MoveGameToInProgressStateParams {
  gameId: string;
  startPrice: Decimal;
}

interface MoveGameToCloseStateParams {
  gameId: string;
  winnerId: string | null;
  winnerBetId: string | null;
}

interface MoveBetToCloseStateParams {
  id: string;
  result: BetResultEnum;
  place: number | null;
  fee: Decimal | null;
  pnl: Decimal | null;
  outcome: Decimal | null;
  multiplier: number;
  isExact: boolean;
}

interface CreateGameParams {
  timeframe: number;
  assetId: string;
  amount: Decimal;
  startAt: Date;
  endAt: Date;
  stopBetsAt: Date;
}

interface GetGameByIdParams {
  gameId: string;
}

@Injectable()
export class BullsEyeGameRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService<Config>,
  ) {}

  async startTransaction<Result>(callback: (transaction: DBTransaction) => Promise<Result>): Promise<Result> {
    return this.prismaService.$transaction(callback);
  }

  async getActiveGames() {
    return this.prismaService.gameBullseye.findMany({
      where: {
        state: {
          in: [GameStateEnum.OPEN, GameStateEnum.INPROGRESS],
        },
      },
    });
  }

  async createGame(params: CreateGameParams, transaction?: DBTransaction): Promise<GameBullseye> {
    const prismaClient = transaction ?? this.prismaService;

    const { assetId, timeframe, startAt, endAt, stopBetsAt, amount } = params;

    const createdGame = await prismaClient.gameBullseye.create({
      data: {
        state: GameStateEnum.OPEN,
        type: GameTypeEnum.BULLSEYE,
        assetId,
        startPrice: null,
        endPrice: null,
        timeframe,
        startAt,
        endAt,
        stopBetsAt,
        data: {},
        pools: {},
        amount,
      },
    });

    return createdGame;
  }

  async getGameByIdWithBets(params: GetGameByIdParams) {
    const { gameId } = params;

    return this.prismaService.gameBullseye.findFirst({
      where: {
        id: gameId,
      },
      include: {
        bets: true,
      }
    });
  }

  async moveGameToCloseState(params: MoveGameToCloseStateParams, transaction?: DBTransaction) {
    const { gameId, winnerId, winnerBetId } = params;

    const prismaClient = transaction ?? this.prismaService;

    return prismaClient.gameBullseye.update({
      data: {
        state: GameStateEnum.CLOSE,
        winnerId,
        winnerBetId
      },
      where: {
        id: gameId,
        state: GameStateEnum.PENDING,
      },
    });
  }

  async moveBetToCloseState(params: MoveBetToCloseStateParams, transaction?: DBTransaction) {
    const { id, multiplier, result, fee, outcome, pnl, place, isExact } = params;

    const prismaClient = transaction ?? this.prismaService;

    return prismaClient.betBullseye.update({
      data: {
        multiplier,
        result,
        fee,
        outcome,
        pnl,
        place,
        isExact,
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
        await dbTransaction.betBullseye.updateMany({
          where: {
            gameId,
            result: BetResultEnum.OPEN,
          },
          data: {
            result: BetResultEnum.INPROGRESS,
          },
        });

        const updatedGame = await dbTransaction.gameBullseye.update({
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
    const { endPrice, gameId } = params;
    const { dbTransactionTimeout } = this.configService.get('app');

    const { updatedGame } = await this.prismaService.$transaction(
      async (dbTransaction: DBTransaction) => {
        await dbTransaction.betBullseye.updateMany({
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

        const updatedGame = await dbTransaction.gameBullseye.update({
          where: {
            id: gameId,
          },
          data: {
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