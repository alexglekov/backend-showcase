import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@xyro/libs/logger';
import { DomainEventsPublisher, StreamingEventsPublisher } from '@xyro/libs/events';
import {
  UP_DOWN_BET_CACHE_TTL_SEC,
  UP_DOWN_GAME_CACHE_TTL_SEC,
  UpDownBetChangedDomainEvent,
  UpDownGameChangedDomainEvent,
  UpDownGameChangedDomainEventPayload,
  getUpDownBetCacheKey,
  getUpDownGameCacheKey
} from '@xyro/contracts/up-down';
import { BetUpDown, GameUpDown } from '@prisma/client';
import { RedisService } from '@xyro/libs/redis';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaErrorTypesEnum } from '@xyro/libs/utils';

import { Config } from '../../infrastructure/config';
import { getUpDownGameResults } from './getUpDownGameResult.helper';
import { UpDownGameRepository } from '../../infrastructure/database';
import { AlertManager, RiskLevel } from '../../infrastructure/alert-manager';

@Injectable()
export class UpDownGamesFinalizerService {
  constructor(
    protected readonly logger: LoggerService,
    private readonly configService: ConfigService<Config>,
    private readonly upDownGameRepository: UpDownGameRepository,
    private readonly redisService: RedisService,
    private readonly domainEventsPublisher: DomainEventsPublisher,
    private readonly streamingEventsPublisher: StreamingEventsPublisher,
    private readonly alertManager: AlertManager,
  ) {
    this.logger.setContext(UpDownGamesFinalizerService.name);
  }

  async onUpDownGameChanged(eventPayload: UpDownGameChangedDomainEventPayload) {
    try {
      this.logger.log({
        action: 'Event onUpDownGameChanged from kafka',
        payload: {
          event: eventPayload,
        },
      });

      if (this.upDownGameRepository.isGameInPending(eventPayload.state)) {
        await this.resolveGame(eventPayload);
      } else {
        this.logger.log({
          action: 'Up/Down event was skipped, cuase status not pending',
        });
      }
    } catch (error: any) {
      if (error.name === PrismaClientKnownRequestError.name) {
        if (error.code === PrismaErrorTypesEnum.RecordToUpdateNotFound) {
          this.logger.warn({
            action: `Up/Down Game to move into CLOSE state not found`,
            payload: {
              event: eventPayload,
            }
          })
          return;
        }
      }

      this.logger.error({
        action: 'Error occured during finalizing game Up/Down game',
        payload: {
          event: eventPayload,
          errorMessage: error.message,
          errorStack: error.stack,
        },
      });

      await this.alertManager.notify({
        title: 'Error move Up/Down into CLOSE state',
        description: `\nError occured on <b>UpDownGamesFinalizerService.resolveGame</b> method with message: ${
          error.message
        }\n\n<b>Application will restart</b>\n`,
        level: RiskLevel.high,
      });

      process.exit(1);
    }
  }

  private async resolveGame(eventPayload: UpDownGameChangedDomainEventPayload) {
    const { id: gameId } = eventPayload;

    const { platformFee } = this.configService.get('app')

    const foundPendingGame = await this.upDownGameRepository.getGameById({
      gameId
    });

    if (foundPendingGame && this.upDownGameRepository.isGameInPending(foundPendingGame.state)) {
      const { losers, rejects, winners } = getUpDownGameResults(
        foundPendingGame,
        platformFee,
      );

      const {
        closedGame: updatedGame,
        closedBets,
      } = await this.upDownGameRepository.startTransaction(
        async (dbTransaction) => {
          const closedBets = await Promise.all(
            [...losers, ...rejects, ...winners].map(
              (bet) => this.upDownGameRepository.moveBetToCloseState({
                id: bet.id,
                result: bet.result,
                fee: bet.fee,
                pnl: bet.pnl,
                outcome: bet.outcome,
                multiplier: bet.multiplier,
                transaction: dbTransaction,
              }),
            ),
          );

          const closedGame = await this.upDownGameRepository.moveGameToCloseState({
            gameId,
            transaction: dbTransaction
          });

          await this.redisService.set<GameUpDown>(
            getUpDownGameCacheKey(closedGame.id),
            closedGame,
            {
              expiresInSeconds: UP_DOWN_GAME_CACHE_TTL_SEC,
            },
          );

          return {
            closedGame,
            closedBets,
          };
        }
      );

      await Promise.allSettled(
        closedBets.map((bet) => this.redisService.set<BetUpDown>(
          getUpDownBetCacheKey(updatedGame.id, bet.id),
          bet,
          {
            expiresInSeconds: UP_DOWN_BET_CACHE_TTL_SEC,
          }
        )),
      );

      await Promise.allSettled([
        this.streamingEventsPublisher.publish(new UpDownGameChangedDomainEvent(updatedGame)),
        this.domainEventsPublisher.publish(new UpDownGameChangedDomainEvent(updatedGame)),
      ]);

      await Promise.allSettled(
        closedBets.map((bet) => this.domainEventsPublisher.publish(new UpDownBetChangedDomainEvent(bet))),
      );

      this.logger.log({
        action: 'Up/Down game was finalized',
        payload: {
          event: eventPayload,
        },
      });
    }

    if (!foundPendingGame || !this.upDownGameRepository.isGameInPending(foundPendingGame.state)) {
      this.logger.warn({
        action: 'Up/Down game not found for finalizing',
        payload: {
          gameId,
          event: eventPayload,
        },
      });
    } 
  }
}
