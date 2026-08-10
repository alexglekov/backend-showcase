import { BetResultEnum, BetX1000, GameStateEnum } from '@prisma/client';
import { DateTime } from 'luxon';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { GameLedgerService } from '@xyro/libs/ledger';
import { LoggerService } from '@xyro/libs/logger';
import { SchedulerService } from '@xyro/libs/scheduler';
import { PrismaTransaction } from '@xyro/libs/utils';
import { DomainEventsPublisher, StreamingEventsPublisher } from '@xyro/libs/events';
import { BalanceUpdatedDomainEvent } from '@xyro/contracts/ledger';
import { X1000BetChangedDomainEvent, X1000GameChangedDomainEvent } from '@xyro/contracts/x1000';

import {
  X1000_HOURLY_FEE_FREQUENCY,
  X1000_HOURLY_FEE_FREQUENCY_IN_MILLISECONDS,
  X1000_NUMBER_HOURS_FOR_FREE_BET,
  X1000_TIME_TO_REPEAT_OPERATION,
} from '../constants';
import { PrismaService } from '../../../infrastructure/prisma';

@Injectable()
export class X1000GameHourlyWorker implements OnModuleInit {
  constructor(
    private readonly logger: LoggerService,
    private readonly prismaService: PrismaService,
    private readonly ledgerService: GameLedgerService,
    private readonly scheduleService: SchedulerService,
    private readonly domainEventsPublisher: DomainEventsPublisher,
    private readonly streamingEventsPublisher: StreamingEventsPublisher,
  ) {
    this.logger.setContext(X1000GameHourlyWorker.name);
  }

  async onModuleInit() {
    const activeBets = await this.prismaService.betX1000.findMany({
      where: {
        result: {
          in: [BetResultEnum.INPROGRESS],
        },
      },
    });
    // what to do with comission after restart game,
    // must we take ( it is our problem, that server lie down )?
    for (const activeBet of activeBets) {
      this.registBet(activeBet);
    }
  }

  public async registGame(gameId: string) {
    const date = DateTime.fromJSDate(new Date())
      .plus({
        hours: X1000_NUMBER_HOURS_FOR_FREE_BET,
      })
      .toJSDate();
    this.scheduleService.scheduleJob({
      jobName: this.getJobNameForHourlyFee(gameId),
      callback: async () => this.onEightHoursHavePassed(gameId),
      date,
    });
  }

  public async registBet(bet: BetX1000) {
    const date = DateTime.fromJSDate(new Date())
      .plus({
        hours: X1000_NUMBER_HOURS_FOR_FREE_BET,
      })
      .toJSDate();
    this.scheduleService.scheduleJob({
      jobName: this.getJobNameForHourlyFee(bet.gameId),
      callback: async () => this.onEightHoursHavePassed(bet.gameId),
      date,
    });
  }

  public async unregistGame(gameId: string) {
    this.scheduleService.deleteRepeatJob(this.getJobNameForHourlyFee(gameId));
    this.scheduleService.deleteJob(this.getJobNameForHourlyFee(gameId));
  }

  private async onEightHoursHavePassed(gameId: string) {
    try {
      this.scheduleService.scheduleRepeatJob({
        jobName: this.getJobNameForHourlyFee(gameId),
        callback: async () => this.takeCommissionFromBet(gameId),
        milliseconds: X1000_HOURLY_FEE_FREQUENCY_IN_MILLISECONDS,
      });
    } catch (error) {
      this.logger.error(error, error.stack);

      setTimeout(
        () => this.onEightHoursHavePassed(gameId),
        X1000_TIME_TO_REPEAT_OPERATION
      );
    }
  }

  private async takeCommissionFromBet(gameId: string) {
    try {
      const bet = await this.prismaService.betX1000.findFirst({
        where: {
          gameId: gameId,
          result: BetResultEnum.INPROGRESS,
        },
        include: {},
      });

      if (!bet) {
        this.unregistGame(gameId);
        return;
      }

      const feeAmount = new Decimal(bet.amount).mul(X1000_HOURLY_FEE_FREQUENCY);

      try {
        const [updatedBalance] = await this.prismaService.$transaction(
          async (dbTransaction: PrismaTransaction) => {
            const updatedBalance = await this.ledgerService.payBetFee(
              bet.ownerId,
              feeAmount,
              bet.gameId,
              dbTransaction
            );
            return [updatedBalance];
          }
        );
        // if error occured, we just skip that
        try {
          await this.domainEventsPublisher.publish(
            new BalanceUpdatedDomainEvent({
              accountId: updatedBalance.accountId,
              amount: updatedBalance.amount,
              id: updatedBalance.id!,
              createdAt: updatedBalance.createdAt,
            })
          );
        } catch (error) {
          this.logger.error(error, error.stack);
        }
        this.logger.log(`Hourly commission from game ${gameId} taken`);
      } catch (error) {
        // cancel game
        const [updatedGame] = await this.prismaService.$transaction(
          async (dbTransaction: PrismaTransaction) => {
            const [updatedGame] = await Promise.all([
              dbTransaction.gameX1000.update({
                where: {
                  id: gameId,
                },
                data: {
                  state: GameStateEnum.PENDING,
                },
              }),
              dbTransaction.betX1000.updateMany({
                where: {
                  gameId: gameId,
                },
                data: {
                  result: BetResultEnum.PENDING,
                },
              }),
            ]);
            return [updatedGame]
          }
        );

        await this.domainEventsPublisher.publish(new X1000GameChangedDomainEvent(updatedGame));

        await Promise.allSettled([this.streamingEventsPublisher.publish(new X1000BetChangedDomainEvent(bet))]);

        this.unregistGame(gameId);
      }
    } catch (error) {
      this.logger.error(error, error.stack);
      setTimeout(
        () => this.takeCommissionFromBet(gameId),
        X1000_TIME_TO_REPEAT_OPERATION
      );
    }
  }

  private getJobNameForHourlyFee(gameId: string) {
    return `game:x1000:hourlyfee:${gameId}`;
  }
}
