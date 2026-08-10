import { Injectable } from '@nestjs/common';
import { BetResultEnum, GameSetupResultEnum, GameStateEnum, Prisma } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@xyro/libs/logger';

import { PrismaService, DBTransaction } from '../prisma';
import { Config } from '../../config';

interface MoveGameToPendingStateParams {
  gameId: string;
  endPrice: Decimal | null;
}

interface MoveGameToInProgressStateParams {
  gameId: string;
}

interface MoveGameToCloseStateParams {
  gameId: string;
  ownerProfit?: Decimal;
  result: GameSetupResultEnum;
  transaction?: DBTransaction;
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

@Injectable()
export class SetupGameRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly loggerService: LoggerService,
    private readonly configService: ConfigService<Config>,
  ) {}

  async startTransaction<Result>(callback: (transaction: DBTransaction) => Promise<Result>): Promise<Result> {
    return this.prismaService.$transaction(callback);
  }

  async getActiveGames() {
    return this.prismaService.gameSetup.findMany({
      where: {
        state: {
          in: [GameStateEnum.OPEN, GameStateEnum.INPROGRESS],
        },
      },
    });
  }

  async getBetsCountByGameId(gameId: string) {
    return this.prismaService.betSetup.count({
      where: {
        gameId
      },
    });
  }

  async getPendingGameById(gameId: string) {
    return this.prismaService.gameSetup.findFirstOrThrow({
      where: {
        id: gameId,
        state: GameStateEnum.PENDING,
      },
      include: {
        bets: true,
      }
    });
  }

  async moveGameToCloseState(params: MoveGameToCloseStateParams) {
    const { gameId, transaction, ownerProfit, result } = params;

    const prismaClient = transaction ?? this.prismaService;

    return prismaClient.gameSetup.update({
      data: {
        state: GameStateEnum.CLOSE,
        ownerProfit,
        result,
      },
      where: {
        id: gameId,
        state: GameStateEnum.PENDING,
      },
      include: {
        bets: true,
      }
    });
  }

  async moveBetToCloseState(params: MoveBetToCloseStateParams) {
    const { id, transaction, multiplier, result, fee, outcome, pnl } = params;

    const prismaClient = transaction ?? this.prismaService;

    this.loggerService.log({
      action: 'Setup bet will update',
      payload: {
        id,
        updateBetData: {
          betId: id,
          multiplier: multiplier,
          result: result,
          fee: fee ? Number(fee) : undefined,
          outcome: outcome ? Number(outcome) : undefined,
          pnl: pnl ? Number(pnl) : undefined,
        }
      }
    });

    return prismaClient.betSetup.update({
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
    const { gameId } = params;
    const { dbTransactionTimeout } = this.configService.get('app');

    const { updatedGame } = await this.prismaService.$transaction(
      async (dbTransaction: DBTransaction) => {
        await dbTransaction.betSetup.updateMany({
          where: {
            gameId,
            result: BetResultEnum.OPEN,
          },
          data: {
            result: BetResultEnum.INPROGRESS,
          },
        });

        const updatedGame = await dbTransaction.gameSetup.update({
          where: {
            id: gameId,
            state: GameStateEnum.OPEN,
          },
          data: {
            state: GameStateEnum.INPROGRESS,
          },
          include: {
            bets: true,
          }
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
        await dbTransaction.betSetup.updateMany({
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

        const updatedGame = await dbTransaction.gameSetup.update({
          where: {
            id: gameId,
            state: {
              in: [GameStateEnum.INPROGRESS, GameStateEnum.OPEN],
            }
          },
          data: {
            state: GameStateEnum.PENDING,
            endPrice,
          },
          include: {
            bets: true,
          }
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