import { lastValueFrom } from 'rxjs';
import {
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GameStateEnum, GameUpDown } from '@prisma/client';
import { DateTime } from 'luxon';
import { GameLedgerService } from '@xyro/libs/ledger';
import { AppsNames } from '@xyro/core';
import { Decimal } from 'decimal.js';
import {
  UP_DOWN_GAME_CACHE_TTL_SEC,
  UpDownGameChangedDomainEvent,
  UpDownGameChangedDomainEventPayload,
  getCurrentUpDownGameIdCacheKey,
  getUpDownGameCacheKey
} from '@xyro/contracts/up-down';
import { SchedulerService } from '@xyro/libs/scheduler';
import { LoggerService } from '@xyro/libs/logger';
import { PricesService } from '@xyro/contracts/prices';
import { DomainEventsPublisher, StreamingEventsPublisher } from '@xyro/libs/events';
import { PrismaErrorTypesEnum, sleep } from '@xyro/libs/utils';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { RedisService } from '@xyro/libs/redis';

import { Config } from '../../infrastructure/config';
import { UpDownGameRepository } from '../../infrastructure/database';
import { AlertManager, RiskLevel } from '../../infrastructure/alert-manager';

interface StartUpDownGameParams {
  gameId: string;
}

interface FinishUpDownGameParams {
  gameId: string;
  startPrice?: number;
}

@Injectable()
export class UpDownGameWorker implements OnModuleInit {
  constructor(
    @Inject(AppsNames.Prices) private readonly pricesService: PricesService,
    private readonly configService: ConfigService<Config>,
    protected readonly logger: LoggerService,
    private readonly upDownGameRepository: UpDownGameRepository,
    private readonly ledgerService: GameLedgerService,
    private readonly domainEventsPublisher: DomainEventsPublisher,
    private readonly streamingEventsPublisher: StreamingEventsPublisher,
    private readonly schedulerService: SchedulerService,
    private readonly redisService: RedisService,
    private readonly alertManager: AlertManager
  ) {
    this.logger.setContext(UpDownGameWorker.name);
  }

  async onModuleInit() {
    try {
      this.logger.log({
        action: `Start closing current active up/down games`,
      });

      const countClosedActiveGames = await this.moveAllOpenGamesToPendingState();

      this.logger.log({
        action: `Closing current active up/down games finished`,
        payload: {
          countClosedActiveGames,
        },
      });

      await this.onUpDownGameClosed();
    } catch (error) {
      await this.alertManager.notify({
        title: 'Error occured during init Up/Down Game worker',
        description: `\nError occured on <b>UpDownGameWorker.onModuleInit</b> method with message: ${
          error.message
        }\n\n<b>Application will restart</b>\n`,
        level: RiskLevel.high,
      });

      process.exit(1);
    }
  }

  private async moveAllOpenGamesToPendingState(): Promise<number> {
    const foundGames = await this.upDownGameRepository.getActiveGames();

    this.logger.log({
      action: `Up/Down games ids to be closed`,
      payload: {
        upDownGamesIds: foundGames.map((game) => game.id),
      }
    });

    for (const foundGame of foundGames) {
      const updatedGame = await this.upDownGameRepository.moveGameToPendingState({
        endPrice: null,
        gameId: foundGame.id,
        isUp: null,
      });

      await this.domainEventsPublisher.publish(new UpDownGameChangedDomainEvent(updatedGame));
      
      await Promise.allSettled([
        this.streamingEventsPublisher.publish(new UpDownGameChangedDomainEvent(updatedGame))
      ]);

      this.logger.log({
        action: `onModuleInit: Up/Down Game moved into pending state`,
        payload: {
          gameId: foundGame.id,
        }
      });
    }

    return foundGames.length;
  }

  async onUpDownGameChanged(eventPayload: UpDownGameChangedDomainEventPayload) {
    try {
      this.logger.log({
        action: 'Event onUpDownGameChanged from kafka',
        payload: {
          event: eventPayload,
        },
      });

      if (this.upDownGameRepository.isGameOpen(eventPayload.state)) await this.onUpDownGameOpened(eventPayload);
      if (this.upDownGameRepository.isGameInProgress(eventPayload.state)) await this.onUpDownGameStarted(eventPayload);
      if (this.upDownGameRepository.isGameClose(eventPayload.state)) await this.onUpDownGameClosed();

      this.logger.log({
        action: 'Event onUpDownGameChanged from kafka successfully handled',
        payload: {
          event: eventPayload,
        },
      });
    } catch (error: any) {
      this.logger.error({
        action: 'Error occured during hanlding event onUpDownGameChanged from kafka',
        payload: {
          event: eventPayload,
          errorMessage: error.message,
          errorStack: error.stack,
        },
      });

      throw error;
    }
  }

  async onUpDownGameOpened(eventPayload: UpDownGameChangedDomainEventPayload): Promise<void> {
    const { id: gameId, stopBetsAt } = eventPayload;

    this.schedulerService.scheduleJob({
      callback: this.startUpDownGameSchedulerCallback.bind(this, gameId),
      jobName: GameStateEnum.OPEN,
      date: stopBetsAt!,
    });

    this.logger.log({
      action: `Up/Down Game scheduled to start`,
      payload: {
        gameId,
      }
    });
  }

  async startUpDownGameSchedulerCallback(gameId: string) {
    try {
      await this.startUpDownGame({ gameId });
    } catch (error) {
      this.logger.error({
        action: 'Error move Up/Down Game into IN PROGRESS state',
        payload: {
          gameId,
          currentTimestamp: Date.now(),
          errorMessage: error.message,
          errorStack: error.stack,
        }
      });

      await this.alertManager.notify({
        title: 'Error move Up/Down into IN PROGRESS state',
        description: `\nError occured on <b>UpDownGameWorker.startUpDownGame</b> method with message: ${
          error.message
        }\n\n<b>Application will restart</b>\n`,
        level: RiskLevel.high,
      });

      process.exit(1);
    }
  }

  private async startUpDownGame(params: StartUpDownGameParams) {
    try {
      const startPrice = await this.getCurrentPrice();

      const { gameId } = params;

      const updatedGame = await this.upDownGameRepository.moveGameToInProgressState({
        gameId,
        startPrice,
      });

      await this.redisService.set<GameUpDown>(
        getUpDownGameCacheKey(updatedGame.id),
        updatedGame,
        {
          expiresInSeconds: UP_DOWN_GAME_CACHE_TTL_SEC,
        },
      );

      await Promise.allSettled([
        this.streamingEventsPublisher.publish(new UpDownGameChangedDomainEvent(updatedGame))
      ]);

      await this.domainEventsPublisher.publish(new UpDownGameChangedDomainEvent(updatedGame));

      this.logger.log({
        action: `Up/Down Game moved into IN PROGRESS state`,
        payload: {
          gameId: updatedGame.id,
        }
      });
    } catch (error) {
      if (error.name === PrismaClientKnownRequestError.name) {
        if (error.code === PrismaErrorTypesEnum.RecordToUpdateNotFound) {
          this.logger.warn({
            action: `Up/Down Game to move into IN PROGRESS state not found`,
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

  async onUpDownGameStarted(eventPayload: UpDownGameChangedDomainEventPayload): Promise<void> {
    const { id: gameId, endAt, startPrice } = eventPayload;

    this.schedulerService.scheduleJob({
      callback: this.finishUpDownGameSchedulerCallback.bind(this, gameId, startPrice),
      jobName: GameStateEnum.INPROGRESS,
      date: endAt!,
    });

    this.logger.log({
      action: `Up/Down Game scheduled to moved into PENDING state`,
      payload: {
        gameId,
      }
    });
  }

  async finishUpDownGameSchedulerCallback(gameId: string, startPrice?: number) {
    try {
      await this.finishUpDownGame({ gameId, startPrice });
    } catch (error) {
      this.logger.error({
        action: 'Error move Up/Down Game into PENDING state',
        payload: {
          gameId,
          currentTimestamp: Date.now(),
          errorMessage: error.message,
          errorStack: error.stack,
        }
      });

      await this.alertManager.notify({
        title: 'Error move Up/Down into PENDING state',
        description: `\nError occured on <b>UpDownGameWorker.finishUpDownGame</b> method with message: ${
          error.message
        }\n\n<b>Application will restart</b>\n`,
        level: RiskLevel.high,
      });

      process.exit(1);
    }
  }

  async finishUpDownGame(params: FinishUpDownGameParams): Promise<void> {
    try {
      const { gameId, startPrice } = params;

      const endPrice = startPrice ? await this.getCurrentPrice() : null;
      const isUp = startPrice ? Number(endPrice) > startPrice : null;

      const updatedGame = await this.upDownGameRepository.moveGameToPendingState({
        gameId,
        endPrice,
        isUp,
      });

      await this.redisService.set<GameUpDown>(
        getUpDownGameCacheKey(updatedGame.id),
        updatedGame,
        {
          expiresInSeconds: UP_DOWN_GAME_CACHE_TTL_SEC,
        },
      );

      await Promise.allSettled([
        this.streamingEventsPublisher.publish(new UpDownGameChangedDomainEvent(updatedGame))
      ]);

      await this.domainEventsPublisher.publish(new UpDownGameChangedDomainEvent(updatedGame));

      this.logger.log({
        action: `Up/Down Game moved into PENDING state`,
        payload: {
          gameId: updatedGame.id,
        }
      });
    } catch (error) {
      if (error.name === PrismaClientKnownRequestError.name) {
        if (error.code === PrismaErrorTypesEnum.RecordToUpdateNotFound) {
          this.logger.warn({
            action: `Up/Down Game to move into PENDING state not found`,
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

  private async onUpDownGameClosed(): Promise<void> {
    try {
      const { startDelay, asset, timeframeSeconds } = this.configService.get('app');
      await sleep(startDelay);

      const startAt = DateTime.now()

      const stopBetsAt = startAt.plus({ seconds: timeframeSeconds / 2 });
      const endAt = startAt.plus({ seconds: timeframeSeconds });

      const createdGame = await this.upDownGameRepository.startTransaction(async (dbTransaction) => {
        const game = await this.upDownGameRepository.createGame(
          {
            assetId: asset,
            startAt: startAt.toJSDate(),
            stopBetsAt: stopBetsAt.toJSDate(),
            endAt: endAt.toJSDate(),
            timeframe: timeframeSeconds,
          },
          dbTransaction,
        );
        await this.ledgerService.createGameAccount(game.id, dbTransaction);

        await this.redisService.set<GameUpDown>(
          getUpDownGameCacheKey(game.id),
          game,
          {
            expiresInSeconds: UP_DOWN_GAME_CACHE_TTL_SEC,
          },
        );

        await this.redisService.set<string>(
          getCurrentUpDownGameIdCacheKey(),
          game.id,
          {
            expiresInSeconds: UP_DOWN_GAME_CACHE_TTL_SEC, 
          },
        );

        return game;
      });

      this.logger.log({
        action: `Up/Down Game created`,
        payload: {
          gameId: createdGame.id,
        }
      });

      await Promise.allSettled([
        this.streamingEventsPublisher.publish(new UpDownGameChangedDomainEvent(createdGame))
      ]);

      await this.domainEventsPublisher.publish(new UpDownGameChangedDomainEvent(createdGame));

      this.logger.log({
        action: `Created Up/Down Game published`,
        payload: {
          gameId: createdGame.id,
        }
      });
    } catch (error) {
      this.logger.error({
        action: 'Error during creating new Up/Down game',
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
    const { asset } = this.configService.get('app');
    try {
      const currentPrice = await lastValueFrom(
        this.pricesService.getAssetCurrentPrice({ assetId: asset })
      );

      return new Decimal(currentPrice.price);
    } catch (error) {
      this.logger.error({
        action: 'Error occured during getting current asset',
        payload: {
          assetId: asset,
          currentTimestamp: Date.now(),
          errorMessage: error.message,
          errorStack: error.stack,
        }
      });

      await this.alertManager.notify({
        title: '<b>Error on getting price for Up/Down Game</b>',
        description: `Error occured on <b>UpDownGameWorker.getCurrentPrice</b> method with message: ${
          error.message
        }\n\n<b>Application will restart</b>\n`,
        level: RiskLevel.high,
      });

      process.exit(1);
    }
  }
}
