import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@xyro/libs/logger';
import { SetupBetChangedDomainEvent, SetupGameChangedDomainEvent, SetupGameChangedDomainEventPayload } from '@xyro/contracts/setups';
import { DomainEventsPublisher } from '@xyro/libs/events';

import { SetupGameRepository } from '../../infrastructure/database';
import { Config } from '../../infrastructure/config';
import { getSetupGameResult } from './getSetupGameResult.helper';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaErrorTypesEnum } from '@xyro/libs/utils';

@Injectable()
export class SetupGamesFinalizerService {
  constructor(
    protected readonly logger: LoggerService,
    private readonly configService: ConfigService<Config>,
    private readonly setupGameRepository: SetupGameRepository,
    private readonly domainEventsPublisher: DomainEventsPublisher,
  ) {
    this.logger.setContext(SetupGamesFinalizerService.name);
  }

  public async onSetupGameStateChanged(event: SetupGameChangedDomainEventPayload) {
    this.logger.log({
      action: 'Event onSetupGameStateChanged from kafka',
      payload: {
        event,
      },
    });

    try {
      if (!this.setupGameRepository.isGameInPending(event.state)) return;

      await this.moveGameToCloseState(event.id);
    } catch (error) {
      if (error.name === PrismaClientKnownRequestError.name) {
        if (error.code === PrismaErrorTypesEnum.RecordToUpdateNotFound) {
          this.logger.warn({
            action: `Setup Game to move into CLOSE state not found`,
            payload: {
              gameId: event.id,
            }
          })
          return;
        }
      }

      this.logger.error({
        action: `Error on moving setup game into close state with id ${event.id}`,
        payload: {
          gameId: event.id,
          errorMessage: error.message,
          errorStack: error.stack,
        }
      });

      throw error;
    }
  }

  async moveGameToCloseState(gameId: string) {
    const { platformFee } = this.configService.get('app');

    const foundGame = await this.setupGameRepository.getPendingGameById(gameId);

    const { influencer, losers, rejects, winners, result } = getSetupGameResult({
      ...foundGame,
      platformFee,
    });

    const updatedGame = await this.setupGameRepository.startTransaction(
      async (transaction) => {
        await Promise.all([
          [...winners, ...losers, ...rejects]
            .map((bet) => this.setupGameRepository.moveBetToCloseState({ ...bet, transaction })),
        ]);

        return await this.setupGameRepository.moveGameToCloseState({
          gameId,
          transaction,
          result,
          ownerProfit: influencer.pnl || undefined,
        });
      }
    );

    await Promise.allSettled([
      this.domainEventsPublisher.publish(new SetupGameChangedDomainEvent(updatedGame)),
      Promise.all(updatedGame.bets.map((bet) => this.domainEventsPublisher.publish(new SetupBetChangedDomainEvent(bet)))),
    ]);

    this.logger.log({
      action: `Setup game was resolved with ID <${foundGame.id}>.`,
      payload: {
        gameId: foundGame.id,
      }
    });
  }
}
