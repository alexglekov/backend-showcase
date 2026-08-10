import { Injectable } from '@nestjs/common';
import { GameStateEnum } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { getOneVsOneGameResults } from '@xyro/core';
import { LoggerService } from '@xyro/libs/logger';
import { DomainEventsPublisher } from '@xyro/libs/events';
import { OneVsOneBetChangedDomainEvent, OneVsOneGameChangedDomainEvent } from '@xyro/contracts/one-vs-one';

import { Config, gameConfig } from '../infrastructure/config';
import { DBTransaction, PrismaService } from '../infrastructure/prisma';

@Injectable()
export class OneVsOneGamesFinalizerService {
  constructor(
    protected readonly logger: LoggerService,
    private readonly configService: ConfigService<Config>,
    private readonly prismaService: PrismaService,
    private readonly domainEventsPublisher: DomainEventsPublisher
  ) {
    this.logger.setContext(OneVsOneGamesFinalizerService.name);
  }

  async resolveGame(gameIds: string[]) {
    const { platformFee } = gameConfig;
    const { dbTransactionTimeout } = this.configService.get('app');

    const foundGame = await this.prismaService.game1vs1.findFirst({
      where: {
        id: { in: gameIds },
        state: GameStateEnum.PENDING,
      },
      include: {
        bets: true,
      },
    });

    if (!foundGame) return;

    const { losers, rejects, winners } = getOneVsOneGameResults({
      game: foundGame,
      platformFee: platformFee,
    });

    const {
      updatedGame,
      updatedBets,
    } = await this.prismaService.$transaction(
      async (dbTransaction: DBTransaction) => {
        const [updatedGame, ...updatedBets] = await Promise.all([
          dbTransaction.game1vs1.update({
            data: {
              state: GameStateEnum.CLOSE,
            },
            where: {
              id: foundGame.id,
            },
          }),
          ...losers.map((bet) =>
            dbTransaction.bet1vs1.update({
              data: {
                result: bet.result,
                fee: bet.fee,
                pnl: bet.pnl,
                outcome: bet.outcome,
                multiplier: bet.multiplier,
              },
              where: { id: bet.id },
            })
          ),
          ...rejects.map((bet) =>
            dbTransaction.bet1vs1.update({
              data: {
                result: bet.result,
                fee: bet.fee,
                pnl: bet.pnl,
                outcome: bet.outcome,
                multiplier: bet.multiplier,
              },
              where: { id: bet.id },
            })
          ),
          ...winners.map((bet) =>
            dbTransaction.bet1vs1.update({
              data: {
                result: bet.result,
                fee: bet.fee,
                pnl: bet.pnl,
                outcome: bet.outcome,
                multiplier: bet.multiplier,
              },
              where: { id: bet.id },
            })
          ),
        ]);

        return {
          updatedBets,
          updatedGame,
        };
      },
      {
        timeout: dbTransactionTimeout,
      }
    );

    await Promise.allSettled([
      this.domainEventsPublisher.publish(new OneVsOneGameChangedDomainEvent(updatedGame)),
      ...updatedBets.map((bet) => this.domainEventsPublisher.publish(new OneVsOneBetChangedDomainEvent(bet))),
    ]);

    this.logger.log({
      action: 'Resolve game',
      payload: {
        gameId: updatedGame.id,
      },
    });
  }
}
