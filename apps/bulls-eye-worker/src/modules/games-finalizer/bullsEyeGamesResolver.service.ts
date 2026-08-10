import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@xyro/libs/logger';
import { DomainEventsPublisher, StreamingEventsPublisher } from '@xyro/libs/events';
import {
  BULLS_EYE_BET_CACHE_TTL_SEC,
  BULLS_EYE_GAME_CACHE_TTL_SEC,
  BullsEyeBetChangedDomainEvent,
  BullsEyeGameChangedDomainEvent,
  BullsEyeGameChangedDomainEventPayload,
  getBullsEyeBetCacheKey,
  getBullsEyeGameCacheKey
} from '@xyro/contracts/bulls-eye';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { BetBullseye, GameBullseye } from '@prisma/client';
import { PrismaErrorTypesEnum } from '@xyro/libs/utils';
import { RedisService } from '@xyro/libs/redis';

import { Config, gameConfig } from '../../infrastructure/config';
import { getBullsEyeGameResult } from './getBullsEyeGameResult.helper';
import { BullsEyeGameRepository } from '../../infrastructure/database';
import { AlertManager, RiskLevel } from '../../infrastructure/alert-manager';

@Injectable()
export class BullsEyeGamesFinalizerService {
  constructor(
    protected readonly logger: LoggerService,
    private readonly configService: ConfigService<Config>,
    private readonly bullsEyeGameRepository: BullsEyeGameRepository,
    private readonly domainEventsPublisher: DomainEventsPublisher,
    private readonly streamingEventsPublisher: StreamingEventsPublisher,
    private readonly alertManager: AlertManager,
    private readonly redisService: RedisService,
  ) {
    this.logger.setContext(BullsEyeGamesFinalizerService.name);
  }

  async onBullsEyeGameChanged(eventPayload: BullsEyeGameChangedDomainEventPayload) {
    try {
      this.logger.log({
        action: 'Event onBullsEyeGameChanged from kafka',
        payload: {
          event: eventPayload,
        },
      });

      if (this.bullsEyeGameRepository.isGameInPending(eventPayload.state)) {
        await this.resolveGame(eventPayload);
      } else {
        this.logger.log({
          action: 'Bulls-Eye event was skipped, cuase status not pending',
        });
      }
    } catch (error: any) {
      if (error.name === PrismaClientKnownRequestError.name) {
        if (error.code === PrismaErrorTypesEnum.RecordToUpdateNotFound) {
          this.logger.warn({
            action: `Bulls-Eye Game to move into CLOSE state not found`,
            payload: {
              event: eventPayload,
            }
          })
          return;
        }
      }

      this.logger.error({
        action: 'Error occured during finalizing game Bulls-Eye game',
        payload: {
          event: eventPayload,
          errorMessage: error.message,
          errorStack: error.stack,
        },
      });

      await this.alertManager.notify({
        title: 'Error move Bulls-Eye into CLOSE state',
        description: `\nError occured on <b>BullsEyeGamesFinalizerService.resolveGame</b> method with message: ${
          error.message
        }\n\n<b>Application will restart</b>\n`,
        level: RiskLevel.high,
      });

      process.exit(1);
    }
  }

  private async resolveGame(eventPayload: BullsEyeGameChangedDomainEventPayload) {
    const { id: gameId } = eventPayload;

    const { platformFee } = this.configService.get('app')

    const foundPendingGame = await this.bullsEyeGameRepository.getGameByIdWithBets({
      gameId
    });

    if (foundPendingGame && this.bullsEyeGameRepository.isGameInPending(foundPendingGame.state)) {
      const { losers, rejects, winners } = getBullsEyeGameResult({
        accuracyLevel: gameConfig.accuracyLevel,
        bets: foundPendingGame.bets,
        endPrice: foundPendingGame.endPrice,
        defaultWinnerCoefficients: gameConfig.defaultWinnerCoefficients,
        exactWinnerCoefficients: gameConfig.exactWinnerCoefficients,
        platformFee,
      });

      const {
        updatedBets,
        updatedGame,
      } = await this.bullsEyeGameRepository.startTransaction(
        async (dbTransaction) => {
          const bets = await Promise.all(
            [
              ...losers,
              ...rejects,
              ...winners
            ].map((bet) => this.bullsEyeGameRepository.moveBetToCloseState(bet, dbTransaction)),
          );

          const [winner] = winners;

          const closedGame = await this.bullsEyeGameRepository.moveGameToCloseState(
            {
              gameId,
              winnerId: winner ? winner.ownerId : null,
              winnerBetId: winner ? winner.id : null,
            },
            dbTransaction,
          );

          await this.redisService.set<GameBullseye>(
            getBullsEyeGameCacheKey(closedGame.id),
            closedGame,
            {
              expiresInSeconds: BULLS_EYE_GAME_CACHE_TTL_SEC,
            },
          );

          return {
            updatedBets: bets,
            updatedGame: closedGame,
          }
        }
      );

      await Promise.allSettled(
        updatedBets.map((bet) => this.redisService.set<BetBullseye>(
          getBullsEyeBetCacheKey(updatedGame.id, bet.id),
          bet,
          {
            expiresInSeconds: BULLS_EYE_BET_CACHE_TTL_SEC,
          }
        )),
      );

      await Promise.allSettled([
        this.streamingEventsPublisher.publish(new BullsEyeGameChangedDomainEvent(updatedGame)),
        this.domainEventsPublisher.publish(new BullsEyeGameChangedDomainEvent(updatedGame)),
        updatedBets.map((bet) => this.domainEventsPublisher.publish(new BullsEyeBetChangedDomainEvent(bet))),
      ]);

      this.logger.log({
        action: 'Bulls-Eye game was finalized',
        payload: {
          event: eventPayload,
        },
      });
    }

    if (!foundPendingGame || !this.bullsEyeGameRepository.isGameInPending(foundPendingGame.state)) {
      this.logger.warn({
        action: 'Bulls-Eye game not found for finalizing',
        payload: {
          gameId,
          event: eventPayload,
        },
      });
    } 
  }
}
