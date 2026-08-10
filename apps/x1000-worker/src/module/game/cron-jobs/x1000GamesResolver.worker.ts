import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { GameStateEnum } from '@prisma/client';

import { getX1000GameResult } from '@xyro/core';
import { PrismaTransaction } from '@xyro/libs/utils';
import { LoggerService } from '@xyro/libs/logger';
import { X1000BetChangedDomainEvent, X1000GameChangedDomainEvent, X1000GameChangedDomainEventPayload } from '@xyro/contracts/x1000';
import { DomainEventsPublisher, StreamingEventsPublisher } from '@xyro/libs/events';

import { PrismaService } from '../../../infrastructure/prisma';

import { Config } from 'apps/x1000-worker/src/infrastructure/config';

@Injectable()
export class X1000GamesResolverWorker {
  private isWorking = false;

  constructor(
    protected readonly logger: LoggerService,
    private readonly configService: ConfigService<Config>,
    private readonly prismaService: PrismaService,
    private readonly messageBroker: DomainEventsPublisher,
    private readonly streamingEventsPublisher: StreamingEventsPublisher
  ) {
    this.logger.setContext(X1000GamesResolverWorker.name);
  }

  @Cron(CronExpression.EVERY_SECOND)
  async hanlde() {
    if (this.isWorking) return;
    const { platformFee } = this.configService.get('app');

    try {
      this.isWorking = true;

      const foundPendingGames = await this.prismaService.gameX1000.findMany({
        where: {
          state: GameStateEnum.PENDING,
        },
        include: {
          bets: true,
        },
        take: 10,
      });

      if (foundPendingGames.length > 0) {
        for (const foundGame of foundPendingGames) {
          const gameResult = getX1000GameResult({
            game: foundGame,
            platformFee,
          });

          const {
            updatedBet,
            updatedGame,
          } = await this.prismaService.$transaction(
            async (dbTransaction: PrismaTransaction) => {
              const [updatedGame, updatedBet] = await Promise.all([
                dbTransaction.gameX1000.update({
                  data: {
                    state: GameStateEnum.CLOSE,
                  },
                  where: {
                    id: foundGame.id,
                  },
                }),
                dbTransaction.betX1000.update({
                  data: {
                    result: gameResult.resolvedBet.result,
                    fee: gameResult.resolvedBet.fee,
                    pnl: gameResult.resolvedBet.pnl,
                    outcome: gameResult.resolvedBet.outcome,
                    roi: gameResult.resolvedBet.roi,
                    multiplier: gameResult.resolvedBet.multiplier,
                  },
                  where: { id: gameResult.resolvedBet.id },
                }),
              ]);

              return {
                updatedGame,
                updatedBet,
              }
            }
          );

          await Promise.allSettled([
            this.messageBroker.publish(new X1000GameChangedDomainEvent(updatedGame)),
            this.messageBroker.publish(new X1000BetChangedDomainEvent(updatedBet)),
            this.streamingEventsPublisher.publish(new X1000BetChangedDomainEvent(updatedBet)),
          ]);

          this.logger.log(`Game with ID ${foundGame.id} was resolved.`);
        }
      }

      this.isWorking = false;
    } catch (error) {
      this.logger.error(error.message, error.stack);
      this.isWorking = false;
    } finally {
    }
  }

  public async handleEvent(event:  X1000GameChangedDomainEventPayload) {
    if (event.state === GameStateEnum.PENDING) {
      await this.hanlde();
    }
  }
}
