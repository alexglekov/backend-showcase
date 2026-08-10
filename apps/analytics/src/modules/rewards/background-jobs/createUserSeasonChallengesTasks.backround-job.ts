import { UserChallengeTaskStatus } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { LedgerService } from '@xyro/contracts/ledger';
import { UserCreatedDomainEvent, UserCreatedDomainEventPayload } from '@xyro/contracts/users';
import { AppsNames } from '@xyro/core';
import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';
import { PrismaErrorTypesEnum } from '@xyro/libs/utils';
import { lastValueFrom } from 'rxjs';
import { Inject } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma';
import { RewardsService } from '../rewards.service';

@EventsListener()
export class CreateUserSeasonChallengesTasksBackroundJob {
  constructor(
    @Inject(AppsNames.Ledger) private readonly ledgerService: LedgerService,
    private readonly prismaService: PrismaService,
    private readonly rewardsService: RewardsService,
  ) {}

  @SubscribeDomainEvent(UserCreatedDomainEvent)
  async onUserCreated(@EventPayload() payload: UserCreatedDomainEventPayload) {
    const { id: userId } = payload;
    try {
      const tasks = await this.rewardsService.getCurrentActiveTasks();

      const userBalance = await lastValueFrom(this.ledgerService.getUserBalance({
        userId: userId,
      }));
      
      await this.prismaService.$transaction(async (transaction) => {
        for (const task of tasks) {
          await transaction.userChallengeTask.create({
            data: {
              userId: userId,
              challengeId: task.challengeId,
              seasonId: task.seasonId,
              taskId: task.id,
              isActive: Boolean(!task.blockedByTaskId),
              status: UserChallengeTaskStatus.NOT_COMPLETED,
            }
          });
        };
        await transaction.reward.create({
          data: {
            userId: userId,
            balanceId: userBalance.id,
          }
        });
      })
    } catch (error) {
      if (error.name === PrismaClientKnownRequestError.name) {
        if (error.code === PrismaErrorTypesEnum.UniqueConstraintFailed) return;
      }
      throw error;
    }
  }
}
