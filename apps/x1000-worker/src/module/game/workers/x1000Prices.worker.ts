import { BetResultEnum, GameStateEnum, Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@xyro/libs/logger';
import { PrismaTransaction } from '@xyro/libs/utils';

import {
  X1000_GAME_ASSET,
  X1000_PRICE_CHANGED_TRANSACTION_TIMEOUT,
} from '../constants';

import { PrismaService } from '../../../infrastructure/prisma';

@Injectable()
export class X1000PricesWorker {
  private priceChangedSimaphore = false;

  constructor(
    private readonly logger: LoggerService,
    private readonly prismaService: PrismaService,
  ) {
    this.logger.setContext(X1000PricesWorker.name);
  }

  public async onAssetPriceChanged(assetId: string, assetPrice: number) {
    if (assetId !== X1000_GAME_ASSET) return; // only BTC

    if (this.priceChangedSimaphore) return;

    try {
      this.priceChangedSimaphore = true;

      const bets = await this.prismaService.betX1000.findMany({
        where: {
          AND: [
            {
              result: {
                in: [BetResultEnum.INPROGRESS],
              },
            },
            {
              OR: [
                {
                  AND: [
                    {
                      isLong: true,
                    },
                    {
                      takeProfit: {
                        lte: assetPrice,
                      },
                    },
                  ],
                },
                {
                  AND: [
                    {
                      isLong: true,
                    },
                    {
                      stopLoss: {
                        gte: assetPrice,
                      },
                    },
                  ],
                },
                {
                  AND: [
                    {
                      isLong: false,
                    },
                    {
                      takeProfit: {
                        gte: assetPrice,
                      },
                    },
                  ],
                },
                {
                  AND: [
                    {
                      isLong: false,
                    },
                    {
                      stopLoss: {
                        lte: assetPrice,
                      },
                    },
                  ],
                },
                {
                  AND: [
                    {
                      isLong: true,
                    },
                    {
                      burnPrice: {
                        gte: assetPrice,
                      },
                    },
                  ],
                },
                {
                  AND: [
                    {
                      isLong: false,
                    },
                    {
                      burnPrice: {
                        lte: assetPrice,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        select: {
          gameId: true,
          ownerId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (bets.length === 0) return;

      const gamesIds = bets.map((bet) => bet.gameId);

      await this.prismaService.$transaction(
        async (dbTransaction: PrismaTransaction) => {
          await Promise.all([
            dbTransaction.betX1000.updateMany({
              where: {
                gameId: {
                  in: gamesIds,
                },
              },
              data: {
                result: BetResultEnum.PENDING,
                endPrice: assetPrice,
              },
            }),
            dbTransaction.gameX1000.updateMany({
              where: {
                id: {
                  in: gamesIds,
                },
              },
              data: {
                state: GameStateEnum.PENDING,
                endPrice: assetPrice,
              },
            }),
          ]);
        },
        {
          timeout: X1000_PRICE_CHANGED_TRANSACTION_TIMEOUT,
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        }
      );
    } catch (error) {
      this.logger.error(error, error.stack);
    } finally {
      this.priceChangedSimaphore = false;
    }
  }
}
