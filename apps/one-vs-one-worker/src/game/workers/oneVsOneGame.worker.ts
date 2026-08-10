import {
  Inject,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

import { BetResultEnum, GameStateEnum } from '@prisma/client';
import { AppsNames } from '@xyro/core';
import { SchedulerService } from '@xyro/libs/scheduler';
import { PricesService } from '@xyro/contracts/prices';
import { Decimal } from 'decimal.js';
import { OneVsOneGameChangedDomainEvent, OneVsOneGameChangedDomainEventPayload } from '@xyro/contracts/one-vs-one';
import { LoggerService } from '@xyro/libs/logger';
import { DateTime } from 'luxon';
import { DomainEventsPublisher } from '@xyro/libs/events';


import { Config } from '../../infrastructure/config';
import { DBTransaction, PrismaService } from '../../infrastructure/prisma';

type OneVsOneGameKey = string;
type OneVsOneGamesMap = Map<OneVsOneGameKey, OneVsOneGameChangedDomainEventPayload>;

@Injectable()
export class OneVsOneGameWorker implements OnModuleInit {
  private currentGames: OneVsOneGamesMap = new Map();

  constructor(
    @Inject(AppsNames.Prices) private readonly pricesService: PricesService,
    private readonly configService: ConfigService<Config>,
    protected readonly logger: LoggerService,
    private readonly prismaService: PrismaService,
    private readonly domainEventsPublisher: DomainEventsPublisher,
    private readonly schedulerService: SchedulerService
  ) {
    this.logger.setContext(OneVsOneGameWorker.name);
  }

  async onModuleInit() {
    await this.startAllOpenGamesAfterReboot();
  }

  private async startAllOpenGamesAfterReboot() {
    const foundGames = await this.prismaService.game1vs1.findMany({
      where: {
        state: {
          in: [GameStateEnum.OPEN, GameStateEnum.INPROGRESS],
        },
      },
    });

    for (const foundGame of foundGames) {
      this.registGame(new OneVsOneGameChangedDomainEventPayload(foundGame));
    }
  }

  async onOneVsOneGameChanged(payload: OneVsOneGameChangedDomainEventPayload) {
    this.logger.log({
      action: 'Event from kafka onOneVsOneGameStateChanged',
      payload,
    });

    if ([GameStateEnum.PENDING].includes(payload.state as any)) {
      return this.unregistGame(payload);
    }

    if (
      [GameStateEnum.INPROGRESS, GameStateEnum.OPEN].includes(
        payload.state as any
      )
    ) {
      return this.registGame(payload);
    }

    if ([GameStateEnum.CLOSE].includes(payload.state as any)) {
      return this.logger.log({
        action: 'Game closed',
        payload: {
          gameId: payload.id,
        },
      });
    }

    throw new InternalServerErrorException(
      `Unexpected game state: ${payload.state}`
    );
  }

  private async finalize(gameId: string) {
    const gameState = this.currentGames.get(gameId);

    if (!gameState) {
      this.logger.warn(
        `UnexpectedError: One vs One game with id ${gameId} not found`
      );
      return;
    }

    const currentPrice = await this.getCurrentPrice(gameState.assetId);
    const { dbTransactionTimeout } = this.configService.get('app');

    await this.prismaService.$transaction(
      async (dbTransaction: DBTransaction) => {
        const [finishedGame] = await Promise.all([
          dbTransaction.game1vs1.update({
            data: {
              state: GameStateEnum.PENDING,
              endPrice: currentPrice,
            },
            where: {
              id: gameId,
              state: { in: [GameStateEnum.OPEN, GameStateEnum.INPROGRESS] },
            },
          }),
          dbTransaction.bet1vs1.updateMany({
            data: {
              result: BetResultEnum.PENDING,
            },
            where: {
              gameId,
            },
          }),
        ]);

        await this.domainEventsPublisher.publish(new OneVsOneGameChangedDomainEvent(finishedGame));

        this.logger.log({
          action: 'Pending game',
          payload: { gameId },
        });
      },
      {
        timeout: dbTransactionTimeout,
      }
    );
  }

  private async checkAfterStopBetsAtTime(gameId: string) {
    const game = this.currentGames.get(gameId);

    if (!game) {
      this.logger.warn(
        `UnexpectedError: One vs One game with id ${gameId} not found`
      );
      return;
    }

    const foundBets = await this.prismaService.bet1vs1.findMany({
      where: {
        gameId,
        result: BetResultEnum.OPEN,
      },
    });

    const { dbTransactionTimeout } = this.configService.get('app');

    await this.prismaService.$transaction(
      async (dbTransaction: DBTransaction) => {
        const isReadyForGame = foundBets.length > 1;

        const gameState = isReadyForGame
          ? GameStateEnum.INPROGRESS
          : GameStateEnum.PENDING;
        const betResult = isReadyForGame
          ? BetResultEnum.INPROGRESS
          : BetResultEnum.PENDING;

        const [updatedGame] = await Promise.all([
          dbTransaction.game1vs1.update({
            data: {
              state: gameState,
            },
            where: {
              id: gameId,
              state: GameStateEnum.OPEN,
            },
          }),
          dbTransaction.bet1vs1.updateMany({
            data: {
              result: betResult,
            },
            where: {
              gameId,
              result: BetResultEnum.OPEN,
            },
          }),
        ]);

        await this.domainEventsPublisher.publish(new OneVsOneGameChangedDomainEvent(updatedGame));

        this.logger.log({
          action: 'Game over stop bets time and waiting to be resolved',
          payload: {
            gameId,
          },
        });
      },
      {
        timeout: dbTransactionTimeout,
      }
    );
  }

  private registGame(gameState: OneVsOneGameChangedDomainEventPayload) {
    this.currentGames.set(gameState.id, gameState);

    if (gameState.state === GameStateEnum.OPEN) {
      const diff = this.getUntillDurationTime(String(gameState.stopBetsAt));
      this.logger.log({
        action: 'RegistGame stopBetsAt',
        payload: {
          gameId: gameState.id,
          diff,
        },
      });

      this.schedulerService.scheduleJob({
        callback: () => this.checkAfterStopBetsAtTime(gameState.id),
        date: gameState.stopBetsAt!,
        jobName: this.getCronJobName(gameState.id),
      });
    } else {
      const diff = this.getUntillDurationTime(String(gameState.endAt));
      this.logger.log({
        action: 'RegistGame endAt',
        payload: {
          gameId: gameState.id,
          diff,
        },
      });

      this.schedulerService.scheduleJob({
        callback: () => this.finalize(gameState.id),
        date: gameState.endAt!,
        jobName: this.getCronJobName(gameState.id),
      });
    }
  }

  private unregistGame(gameState: OneVsOneGameChangedDomainEventPayload) {
    this.logger.log({
      action: 'UnregistGame',
      payload: {
        gameId: gameState.id,
      },
    });

    this.currentGames.delete(gameState.id);
    this.schedulerService.deleteJob(this.getCronJobName(gameState.id));
  }

  private getCronJobName(gameId: string): OneVsOneGameKey {
    return `game:onevsone:${gameId}`;
  }

  private async getCurrentPrice(assetId: string) {
    const currentPrice = await lastValueFrom(
      this.pricesService.getAssetCurrentPrice({ assetId })
    );

    return new Decimal(currentPrice.price);
  }

  private getUntillDurationTime(toDate: string) {
    const to = DateTime.fromISO(toDate, { zone: 'UTC' });
    const diff = to.diffNow();

    return diff.toHuman();
  }
}
