import { lastValueFrom } from 'rxjs';
import {
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import {
  BetSetup,
  GameSetup,
} from '@prisma/client';
import { AppsNames } from '@xyro/core';
import { LoggerService } from '@xyro/libs/logger';
import { AssetPriceChangedDomainEventPayload, PricesService } from '@xyro/contracts/prices';
import { Decimal } from 'decimal.js';
import { SetupGameChangedDomainEvent, SetupGameChangedDomainEventPayload } from '@xyro/contracts/setups';
import { SchedulerService } from '@xyro/libs/scheduler';
import { DomainEventsPublisher } from '@xyro/libs/events';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaErrorTypesEnum } from '@xyro/libs/utils';

import { SetupGameRepository } from '../../infrastructure/database';
import { SetupGamesHeapByAsset } from './setupGamesHeap.helper';

@Injectable()
export class SetupGameWorker implements OnModuleInit {
  private readonly setupGamesHeapsByAssets: Map<string, SetupGamesHeapByAsset> = new Map();
  private readonly pricesChangedHandlersPromises: Map<string, Promise<void>> = new Map();

  constructor(
    @Inject(AppsNames.Prices) private readonly pricesService: PricesService,
    private readonly logger: LoggerService,
    private readonly setupGameRepository: SetupGameRepository,
    private readonly domainEventsPublisher: DomainEventsPublisher,
    private readonly scheduleService: SchedulerService
  ) {
    this.logger.setContext(SetupGameWorker.name);
  }

  public async onModuleInit() {
    await this.restartGamesAfterReboot();
  }

  public async onGameChanged(event: SetupGameChangedDomainEventPayload) {
    this.logger.log({
      action: 'Event onSetupGameStateChanged from kafka',
      payload: {
        event,
      },
    });

    if (this.setupGameRepository.isGameClose(event.state) || this.setupGameRepository.isGameInPending(event.state)) {
      const heap = this.getSetupGameHeap(event.assetId);
      heap.deleteGames([event.id]);
    }

    if (this.setupGameRepository.isGameOpen(event.state)) {
      try {
        const heap = this.getSetupGameHeap(event.assetId);

        heap.addGame({
          startAtTimestamp: new Date(event.startAt!).getTime(),
          endAtTimestamp: new Date(event.endAt!).getTime(),
          gameId: event.id,
          isLong: event.isLong,
          stopLoss: Number(event.stopLoss),
          takeProfit: Number(event.takeProfit),
        });
  
        this.scheduleGameStopBetsAtEvent(event.id, new Date(event.stopBetsAt!));
      } catch (error) {
        this.logger.error({
          action: `Cant start setup game with id ${event.id}`,
          payload: {
            errorMessage: error.message,
            errorStack: error.stack,
          }
        });
      }
    }
  }

  public async onAssetPriceChanged(payload: AssetPriceChangedDomainEventPayload) {
    const { assetId, price, timestamp } = payload;

    try {
      const prevPriceChangedHandlerPromise = this.pricesChangedHandlersPromises.get(assetId);

      if (prevPriceChangedHandlerPromise) {
        const startAwaitingHandlerTime = Date.now();

        await prevPriceChangedHandlerPromise;

        const endAwaitingHandlerTime = Date.now();

        if (endAwaitingHandlerTime - startAwaitingHandlerTime > 10) {
          this.logger.warn({
            action: `The price has been processed for a long time`,
            payload: {
              assetId,
              price,
              assetPriceChangedTimestamp: timestamp,
              assetHandleTime: endAwaitingHandlerTime - startAwaitingHandlerTime,
            },
          })
        }
      }

      const newPriceChangedHandlerPromise = this.handlePriceChangedEvent(
        assetId,
        // TODO: convert to number in price service
        Number(price),
        Number(timestamp)
      );

      this.pricesChangedHandlersPromises.set(assetId, newPriceChangedHandlerPromise);
    } catch(error) {
      this.logger.error({
        action: `Error handling price changed event with asset ${assetId}`,
        payload: {
          assetId,
          price,
          assetPriceChangedTimestamp: timestamp,
          errorMessage: error.message,
          errorStack: error.stack,
        },
      });
    }
  }

  private async handlePriceChangedEvent(assetId: string, price: number, timestamp: number): Promise<void> {
    try {
      const getSetupGameHeap = this.getSetupGameHeap(assetId);
      const games = getSetupGameHeap.getGamesByPrice(price, timestamp);

      if (games.length > 0) {
        this.logger.log({
            action: 'Update setup games because assetPriceChanged',
            payload: {
              price,
              assetId,
              assetPriceChangedTimestamp: timestamp,
              games: games.map((game) => game.gameId),
            },
        });

        for (const game of games) {
          const { gameId } = game;

          try {
            const updatedGame = await this.setupGameRepository.moveGameToPendingState({
              gameId,
              endPrice: new Decimal(price),
            });
            
            await this.domainEventsPublisher.publish(new SetupGameChangedDomainEvent(updatedGame));
            
            this.clearAllScheduling(game.gameId);
          } catch (error) {
            if (error.name === PrismaClientKnownRequestError.name && error.code === PrismaErrorTypesEnum.RecordToUpdateNotFound) {
              this.logger.warn({
                action: `Setup Game to move into PENDING state not found`,
                payload: {
                  gameId: game.gameId,
                }
              })
            } else {
              this.logger.error({
                action: `Error in moving setup game to pending state because assetPriceChanged with id ${gameId}`,
                payload: {
                  gameId,
                  assetId,
                  price,
                  assetPriceChangedTimestamp: timestamp,
                  errorMessage: error.message,
                  errorStack: error.stack,
                },
              });
            }
          }
        }
      }
    } catch (error) {
      this.logger.error({
        action: "Error in moving setups games to pending state because assetPriceChanged",
        payload: {
          assetId,
          price,
          assetPriceChangedTimestamp: timestamp,
          errorMessage: error.message,
          errorStack: error.stack,
        },
      });
    }
  }

  private async restartGamesAfterReboot() {
    try {
      const games = await this.setupGameRepository.getActiveGames();
      
      for (const game of games) {
        const heap = this.getSetupGameHeap(game.assetId);
        
        heap.addGame({
          endAtTimestamp: new Date(game.endAt!).getTime(),
          startAtTimestamp: new Date(game.startAt!).getTime(),
          gameId: game.id,
          isLong: game.isLong,
          stopLoss: Number(game.stopLoss),
          takeProfit: Number(game.takeProfit),
        });
      }

      for (const game of games) {
        if (this.setupGameRepository.isGameOpen(game.state)) {
          this.scheduleGameStopBetsAtEvent(game.id, new Date(game.stopBetsAt!));
        } else {
          this.scheduleGameCompletion(game.assetId, game.id, game.endAt!);
        }
        
        this.logger.log({
          action: `Old game launched with ID: ${game.id}`,
          payload: {
            gameId: game.id,
          }
        });
      }
    } catch (error) {
      this.logger.error({
        action: `Error on OnModuleInit in ${SetupGameWorker.name}`,
        payload: {
          errorMessage: error.message,
          errorStack: error.stack,
        }
      });

      throw error;
    }
  }

  private async finalize(assetId: string, gameId: string, endAt: Date) {
    try {
      const assetPrice = await this.getCurrentPrice(assetId);

      const updatedGame = await this.setupGameRepository.moveGameToPendingState({
        gameId,
        endPrice: assetPrice,
      });

      await this.domainEventsPublisher.publish(new SetupGameChangedDomainEvent(updatedGame));

      this.logger.log({
        action: `Setup game moved into pending state with ID: ${gameId}`,
        payload: {
          gameId,
        },
      });
    } catch (error) {
      if (error.name === PrismaClientKnownRequestError.name) {
        if (error.code === PrismaErrorTypesEnum.RecordToUpdateNotFound) {
          this.logger.warn({
            action: `Setup Game to move into PENDING state not found`,
            payload: {
              gameId: gameId,
            }
          })
          return;
        }
      }

      this.logger.error({
        action: `Error on finalizing setup game with id ${gameId}`,
        payload: {
          gameId,
          errorMessage: error.message,
          errorStack: error.stack,
        }
      });

      this.scheduleGameCompletion(assetId, gameId, endAt);
    }
  }

  private async checkAfterStopBetsAtTime(gameId: string, stopBetsAt: Date) {
    try {
      const betsCount = await this.setupGameRepository.getBetsCountByGameId(gameId);

      let updatedGame: GameSetup & { bets: BetSetup[] };

      if (betsCount === 0) {
        updatedGame = await this.setupGameRepository.moveGameToPendingState({
          gameId,
          endPrice: null,
        });

        this.logger.log({
          action: `Setup game closed cause amount bets === 0 with ID: ${gameId}`,
          payload: {
            gameId,
          }
        });
      } else {
        updatedGame = await this.setupGameRepository.moveGameToInProgressState({
          gameId,
        });

        this.scheduleGameCompletion(updatedGame.assetId, updatedGame.id, updatedGame.endAt!);

        this.logger.log({
          action: `Setup game scheduled to complete with ID: ${gameId}`,
          payload: {
            gameId,
          }
        });
      }

      await this.domainEventsPublisher.publish(new SetupGameChangedDomainEvent(updatedGame));
    } catch (error) {
      if (error.name === PrismaClientKnownRequestError.name) {
        if (error.code === PrismaErrorTypesEnum.RecordToUpdateNotFound) {
          this.logger.warn({
            action: `Setup Game to move into IN PROGRESS or PENDING state not found`,
            payload: {
              gameId,
            }
          })
          return;
        }
      }

      this.logger.error({
        action: `Error on moving setup game to in progress or pending state with id ${gameId}`,
        payload: {
          gameId,
          errorMessage: error.message,
          errorStack: error.stack,
        }
      });

      this.scheduleGameStopBetsAtEvent(gameId, stopBetsAt);
    }
  }

  private getSetupGameHeap(assetId: string): SetupGamesHeapByAsset {
    if (!this.setupGamesHeapsByAssets.has(assetId)) {
      this.setupGamesHeapsByAssets.set(assetId, new SetupGamesHeapByAsset({
        assetId,
        games: [],
      }))
    }

    return this.setupGamesHeapsByAssets.get(assetId)!;
  }

  private async getCurrentPrice(assetId: string) {
    const currentPrice = await lastValueFrom(
      this.pricesService.getAssetCurrentPrice({ assetId })
    );

    return new Decimal(currentPrice.price);
  }

  private scheduleGameCompletion(assetId: string, gameId: string, endAt: Date) {
    this.scheduleService.scheduleJob({
      callback: () => this.finalize(assetId, gameId, endAt),
      date: new Date(endAt),
      jobName: this.getCronJobNameByGameIdAtEnd(gameId),
    });
  }

  private scheduleGameStopBetsAtEvent(gameId: string, stopBetsAt: Date) {
    this.scheduleService.scheduleJob({
      callback: () => this.checkAfterStopBetsAtTime(gameId, stopBetsAt),
      date: stopBetsAt,
      jobName: this.getCronJobNameByGameIdAtStopBets(gameId),
    });
  }

  private clearAllScheduling(gameId: string) {
    this.scheduleService.deleteJob(this.getCronJobNameByGameIdAtEnd(gameId));
    this.scheduleService.deleteJob(
      this.getCronJobNameByGameIdAtStopBets(gameId)
    );
  }

  private getCronJobNameByGameIdAtEnd(gameId: string) {
    return `game:setup:${gameId}`;
  }
  private getCronJobNameByGameIdAtStopBets(gameId: string) {
    return `game:setup:stopbets:${gameId}`;
  }
}
