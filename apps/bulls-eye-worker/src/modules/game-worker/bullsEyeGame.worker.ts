import { lastValueFrom } from 'rxjs';
import {
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { GameBullseye, GameStateEnum } from '@prisma/client';
import { DateTime } from 'luxon';
import { GameLedgerService } from '@xyro/libs/ledger';
import { RedisService } from '@xyro/libs/redis';
import { AppsNames } from '@xyro/core';
import { Decimal } from 'decimal.js';
import {
  BULLS_EYE_GAME_CACHE_TTL_SEC,
  BullsEyeGameChangedDomainEvent,
  BullsEyeGameChangedDomainEventPayload,
  getBullsEyeGameCacheKey,
  getCurrentBullsEyeGameIdCacheKey
} from '@xyro/contracts/bulls-eye';
import { SchedulerService } from '@xyro/libs/scheduler';
import { LoggerService } from '@xyro/libs/logger';
import { PricesService } from '@xyro/contracts/prices';
import { DomainEventsPublisher, StreamingEventsPublisher } from '@xyro/libs/events';
import { PrismaErrorTypesEnum, sleep } from '@xyro/libs/utils';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { gameConfig } from '../../infrastructure/config';
import { BullsEyeGameRepository } from '../../infrastructure/database';
import { AlertManager, RiskLevel } from '../../infrastructure/alert-manager';

interface StartBullsEyeGameParams {
  gameId: string;
}

interface FinishBullsEyeGameParams {
  gameId: string;
  startPrice?: number;
}

@Injectable()
export class BullsEyeGameWorker implements OnModuleInit {
  constructor(
    @Inject(AppsNames.Prices) private readonly pricesService: PricesService,
    protected readonly logger: LoggerService,
    private readonly gameRepository: BullsEyeGameRepository,
    private readonly ledgerService: GameLedgerService,
    private readonly domainEventsPublisher: DomainEventsPublisher,
    private readonly streamingEventsPublisher: StreamingEventsPublisher,
    private readonly schedulerService: SchedulerService,
    private readonly redisService: RedisService,
    private readonly alertManager: AlertManager
  ) {
    this.logger.setContext(BullsEyeGameWorker.name);
  }

  async onModuleInit() {
    try {
      this.logger.log({
        action: `Start closing current active Bulls-Eye games`,
      });

      const countClosedActiveGames = await this.moveAllOpenGamesToPendingState();

      this.logger.log({
        action: `Closing current active Bulls-Eye games finished`,
        payload: {
          countClosedActiveGames,
        },
      });

      await this.onBullsEyeGameClosed();
    } catch (error) {
      await this.alertManager.notify({
        title: 'Error occured during init Bulls-Eye Game worker',
        description: `\nError occured on <b>BullsEyeGameWorker.onModuleInit</b> method with message: ${
          error.message
        }\n\n<b>Application will restart</b>\n`,
        level: RiskLevel.high,
      });

      process.exit(1);
    }
  }

  private async moveAllOpenGamesToPendingState(): Promise<number> {
    const foundGames = await this.gameRepository.getActiveGames();

    this.logger.log({
      action: `Bulls-Eye games ids to be closed`,
      payload: {
        bullsEyeGamesIds: foundGames.map((game) => game.id),
      }
    });

    for (const foundGame of foundGames) {
      const updatedGame = await this.gameRepository.moveGameToPendingState({
        endPrice: null,
        gameId: foundGame.id,
      });

      await Promise.allSettled([
        this.streamingEventsPublisher.publish(new BullsEyeGameChangedDomainEvent(updatedGame))
      ]);

      await this.domainEventsPublisher.publish(new BullsEyeGameChangedDomainEvent(updatedGame));

      this.logger.log({
        action: `onModuleInit: Bulls-Eye Game moved into pending state`,
        payload: {
          gameId: foundGame.id,
        }
      });
    }

    return foundGames.length;
  }

  async onBullsEyeGameChanged(eventPayload: BullsEyeGameChangedDomainEventPayload) {
    try {
      this.logger.log({
        action: 'Event onBullsEyeGameChanged from kafka',
        payload: {
          event: eventPayload,
        },
      });

      if (this.gameRepository.isGameOpen(eventPayload.state)) await this.onBullsEyeGameOpened(eventPayload);
      if (this.gameRepository.isGameInProgress(eventPayload.state)) await this.onBullsEyeGameStarted(eventPayload);
      if (this.gameRepository.isGameClose(eventPayload.state)) await this.onBullsEyeGameClosed();

      this.logger.log({
        action: 'Event onBullsEyeGameChanged from kafka successfully handled',
        payload: {
          event: eventPayload,
        },
      });
    } catch (error: any) {
      this.logger.error({
        action: 'Error occured during hanlding event onBullsEyeGameChanged from kafka',
        payload: {
          event: eventPayload,
          errorMessage: error.message,
          errorStack: error.stack,
        },
      });

      throw error;
    }
  }

  async onBullsEyeGameOpened(eventPayload: BullsEyeGameChangedDomainEventPayload): Promise<void> {
    const { id: gameId, stopBetsAt } = eventPayload;

    this.schedulerService.scheduleJob({
      callback: this.startBullsEyeGameSchedulerCallback.bind(this, gameId),
      jobName: GameStateEnum.OPEN,
      date: stopBetsAt!,
    });

    this.logger.log({
      action: `Bulls-Eye Game scheduled to start`,
      payload: {
        gameId,
      }
    });
  }

  async startBullsEyeGameSchedulerCallback(gameId: string) {
    try {
      await this.startBullsEyeGame({ gameId });
    } catch (error) {
      this.logger.error({
        action: 'Error move Bulls-Eye Game into IN PROGRESS state',
        payload: {
          gameId,
          currentTimestamp: Date.now(),
          errorMessage: error.message,
          errorStack: error.stack,
        }
      });

      await this.alertManager.notify({
        title: 'Error move Bulls-Eye into IN PROGRESS state',
        description: `\nError occured on <b>BullsEyeGameWorker.startBullsEyeGame</b> method with message: ${
          error.message
        }\n\n<b>Application will restart</b>\n`,
        level: RiskLevel.high,
      });

      process.exit(1);
    }
  }

  private async startBullsEyeGame(params: StartBullsEyeGameParams) {
    try {
      const startPrice = await this.getCurrentPrice();

      const { gameId } = params;

      const updatedGame = await this.gameRepository.moveGameToInProgressState({
        gameId,
        startPrice,
      })

      await this.redisService.set<GameBullseye>(
        getBullsEyeGameCacheKey(updatedGame.id),
        updatedGame,
        {
          expiresInSeconds: BULLS_EYE_GAME_CACHE_TTL_SEC,
        },
      );

      await Promise.allSettled([
        this.streamingEventsPublisher.publish(new BullsEyeGameChangedDomainEvent(updatedGame))
      ]);

      await this.domainEventsPublisher.publish(new BullsEyeGameChangedDomainEvent(updatedGame));

      this.logger.log({
        action: `Bulls-Eye Game moved into IN PROGRESS state`,
        payload: {
          gameId: updatedGame.id,
        }
      });
    } catch (error) {
      if (error.name === PrismaClientKnownRequestError.name) {
        if (error.code === PrismaErrorTypesEnum.RecordToUpdateNotFound) {
          this.logger.warn({
            action: `Bulls-Eye Game to move into IN PROGRESS state not found`,
            payload: {
              gameId: params.gameId,
            }
          })
          return;
        }
      }

      throw error;
    }
  }

  async onBullsEyeGameStarted(eventPayload: BullsEyeGameChangedDomainEventPayload): Promise<void> {
    const { id: gameId, endAt, startPrice } = eventPayload;

    this.schedulerService.scheduleJob({
      callback: this.finishBullsEyeGameSchedulerCallback.bind(this, gameId, startPrice),
      jobName: GameStateEnum.INPROGRESS,
      date: endAt!,
    });

    this.logger.log({
      action: `Bulls-Eye Game scheduled to moved into PENDING state`,
      payload: {
        gameId,
      }
    });
  }

  async finishBullsEyeGameSchedulerCallback(gameId: string, startPrice?: number) {
    try {
      await this.finishBullsEyeGame({ gameId, startPrice });
    } catch (error) {
      this.logger.error({
        action: 'Error move Bulls-Eye Game into PENDING state',
        payload: {
          gameId,
          currentTimestamp: Date.now(),
          errorMessage: error.message,
          errorStack: error.stack,
        }
      });

      await this.alertManager.notify({
        title: 'Error move Bulls-Eye into PENDING state',
        description: `\nError occured on <b>BullsEyeGameWorker.finishBullsEyeGame</b> method with message: ${
          error.message
        }\n\n<b>Application will restart</b>\n`,
        level: RiskLevel.high,
      });

      process.exit(1);
    }
  }

  async finishBullsEyeGame(params: FinishBullsEyeGameParams): Promise<void> {
    try {
      const { gameId, startPrice } = params;

      const endPrice = startPrice ? await this.getCurrentPrice() : null;

      const updatedGame = await this.gameRepository.moveGameToPendingState({
        gameId,
        endPrice,
      });

      await this.redisService.set<GameBullseye>(
        getBullsEyeGameCacheKey(updatedGame.id),
        updatedGame,
        {
          expiresInSeconds: BULLS_EYE_GAME_CACHE_TTL_SEC,
        },
      );

      await Promise.allSettled([
        this.streamingEventsPublisher.publish(new BullsEyeGameChangedDomainEvent(updatedGame))
      ]);

      await this.domainEventsPublisher.publish(new BullsEyeGameChangedDomainEvent(updatedGame));

      this.logger.log({
        action: `Bulls-Eye Game moved into PENDING state`,
        payload: {
          gameId: updatedGame.id,
        }
      });
    } catch (error) {
      if (error.name === PrismaClientKnownRequestError.name) {
        if (error.code === PrismaErrorTypesEnum.RecordToUpdateNotFound) {
          this.logger.warn({
            action: `Bulls-Eye Game to move into PENDING state not found`,
            payload: {
              gameId: params.gameId,
            }
          })
          return;
        }
      }

      throw error;
    }
  }

  private async onBullsEyeGameClosed(): Promise<void> {
    try {
      await sleep(gameConfig.startDelay);

      const assetId = gameConfig.asset;
  
      const startAt = DateTime.fromJSDate(new Date());  
      const stopBetsAt = startAt.plus({ seconds: gameConfig.openTimeframeSeconds });
      const endAt = stopBetsAt.plus({ seconds: gameConfig.inProgressTimeframeSeconds });

      const createdGame = await this.gameRepository.startTransaction(async (dbTransaction) => {
        const game = await this.gameRepository.createGame(
          {
            amount: new Decimal(gameConfig.betAmount),
            assetId,
            startAt: startAt.toJSDate(),
            stopBetsAt: stopBetsAt.toJSDate(),
            endAt: endAt.toJSDate(),
            timeframe: gameConfig.openTimeframeSeconds + gameConfig.inProgressTimeframeSeconds,
          },
          dbTransaction,
        );
        await this.ledgerService.createGameAccount(game.id, dbTransaction);

        await this.redisService.set<GameBullseye>(
          getBullsEyeGameCacheKey(game.id),
          game,
          {
            expiresInSeconds: BULLS_EYE_GAME_CACHE_TTL_SEC,
          },
        );

        await this.redisService.set<string>(
          getCurrentBullsEyeGameIdCacheKey(),
          game.id,
          {
            expiresInSeconds: BULLS_EYE_GAME_CACHE_TTL_SEC,
          },
        );

        return game;
      });

      this.logger.log({
        action: `Bulls-Eye Game created`,
        payload: {
          gameId: createdGame.id,
        }
      });

      await Promise.allSettled([
        this.streamingEventsPublisher.publish(new BullsEyeGameChangedDomainEvent(createdGame))
      ]);

      await this.domainEventsPublisher.publish(new BullsEyeGameChangedDomainEvent(createdGame));

      this.logger.log({
        action: `Created Bulls-Eye Game published`,
        payload: {
          gameId: createdGame.id,
        }
      });
    } catch (error) {
      this.logger.error({
        action: 'Error during creating new Bulls-Eye game',
        payload: {
          errorMessage: error.message,
          errorStack: error.stack,
        }
      });

      if (error.name === PrismaClientKnownRequestError.name) {
        if (error.code === PrismaErrorTypesEnum.UniqueConstraintFailed) return;
      }

      throw error;
    }
  }

  private async getCurrentPrice() {
    try {
      const currentPrice = await lastValueFrom(
        this.pricesService.getAssetCurrentPrice({ assetId: gameConfig.asset })
      );

      return new Decimal(currentPrice.price);
    } catch (error) {
      this.logger.error({
        action: 'Error occured during getting current asset',
        payload: {
          assetId: gameConfig.asset,
          currentTimestamp: Date.now(),
          errorMessage: error.message,
          errorStack: error.stack,
        }
      });

      await this.alertManager.notify({
        title: '<b>Error on getting price for Bulls-Eye Game</b>',
        description: `Error occured on <b>BullsEyeGameWorker.getCurrentPrice</b> method with message: ${
          error.message
        }\n\n<b>Application will restart</b>\n`,
        level: RiskLevel.high,
      });

      process.exit(1);
    }
  }
}
