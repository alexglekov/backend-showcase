import { BaseEvent, BaseEventPayload, DomainEventsPublisher } from '@xyro/libs/events';
import { ChallengeTaskPattern, Prisma, UserChallengeTaskStatus } from '@prisma/client';
import { ClassConstructor } from 'class-transformer';
import { Injectable } from '@nestjs/common';
import { UserChallengeTaskUpdatedDomainEvent } from '@xyro/contracts/analytics';
import { LoggerService } from '@xyro/libs/logger';

import { ChallengeTaskPatternsHandlersStrategy } from './patternsHandlersStrategy.service';
import { UserChallengeTasksToBeClosed, ManualChallengeTaskArgs } from './basePatternHandler';
import { PrismaService } from '../../../infrastructure/prisma';

const DATABASE_TRANSACTION_TIMEMOUT = 20000;

@Injectable()
export class ChallengeTasksHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly patternsHandlersStrategy: ChallengeTaskPatternsHandlersStrategy,
    protected readonly prismaService: PrismaService,
    protected readonly domainEventsPublisher: DomainEventsPublisher,
  ) {}

  public async handleByPatternManual<T extends ChallengeTaskPattern>(pattern: T, payload: ManualChallengeTaskArgs) {
    const handler = this.patternsHandlersStrategy.getStrategyByPattern(pattern);
    const userChallengeTasksToBeClosed = await handler.handleManual(payload);
    await this.closeChallengeTasks(userChallengeTasksToBeClosed);
  }

  public async handleByEvent(domainEventClass: ClassConstructor<BaseEvent<any>>, payload: BaseEventPayload) {
    const handlers = this.patternsHandlersStrategy.getStrategiesByEvent(domainEventClass);

    const handlingResults = await Promise.allSettled(handlers.map((handler) => handler.handleAuto(payload)));

    const handlingRejectedResult = handlingResults.find((result) => result.status === 'rejected') as PromiseRejectedResult | undefined;

    const userChallengeTasksToBeClosed = handlingResults
      .filter((handlingResult) => handlingResult.status !== 'rejected')
      .map((handlingResult: PromiseFulfilledResult<UserChallengeTasksToBeClosed>) => handlingResult.value)
      .flat(1);

    await this.closeChallengeTasks(userChallengeTasksToBeClosed);

    if (handlingRejectedResult) throw handlingRejectedResult.reason;
  }

  private async closeChallengeTasks(userChallengeTasksToBeClosed: UserChallengeTasksToBeClosed) {
    if (userChallengeTasksToBeClosed.length === 0) return;

    const userChallengeTasksIds = userChallengeTasksToBeClosed.map((userChallengeTask) => userChallengeTask.id);

    const updatedUserChallengeTasks = await this.prismaService.$transaction(
      async (dbTransaction) => {
        await dbTransaction.userChallengeTask.updateMany({
          where: {
            id: {
              in: userChallengeTasksIds,
            }
          },
          data: {
            status: UserChallengeTaskStatus.COMPLETED,
          }
        });

        const updatedUserChallengeTasks = await dbTransaction.userChallengeTask.findMany({
          where: {
            id: { in: userChallengeTasksIds },
          },
        });

        return updatedUserChallengeTasks;
      },
      {
        timeout: DATABASE_TRANSACTION_TIMEMOUT,
        isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
      }
    );

    this.logger.log({
      action: 'User challenge tasks were completed',
      userChallengeTasksIds,
    })

    await Promise.allSettled(updatedUserChallengeTasks.map(
      (updatedUserChallengeTask) => this.domainEventsPublisher.publish(new UserChallengeTaskUpdatedDomainEvent(updatedUserChallengeTask))
    ));
  }
}
