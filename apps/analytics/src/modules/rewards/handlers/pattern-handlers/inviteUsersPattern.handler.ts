import { Inject, Injectable } from '@nestjs/common';
import { User, UserCreatedDomainEvent, UserCreatedDomainEventPayload, UsersService } from '@xyro/contracts/users';
import { ChallengeTaskPattern, UserChallengeTaskStatus } from '@prisma/client';
import { BaseEvent } from '@xyro/libs/events';
import { ClassConstructor } from 'class-transformer';
import { LoggerService } from '@xyro/libs/logger';
import { AppsNames } from '@xyro/core';
import { lastValueFrom } from 'rxjs';

import { UserChallengeTasksToBeClosed, BasePatternHandler, HandlerMode, ManualChallengeTaskArgs } from '../basePatternHandler';
import { PrismaService } from '../../../../infrastructure/prisma';

type TInviteUsersPatternConfiguration = {
  amountInvited: number;
}

@Injectable()
export class InviteUsersPatternHandler extends BasePatternHandler<ChallengeTaskPattern> {
  constructor(
    @Inject(AppsNames.Users) private readonly usersService: UsersService,
    private readonly logger: LoggerService,
    protected readonly prismaService: PrismaService,
  ) {
    super();

    this.logger.setContext(InviteUsersPatternHandler.name);
  }

  public getDomainEventsTriggers(): ClassConstructor<BaseEvent<any>>[] {
    return [UserCreatedDomainEvent];
  }

  public supportModes() {
    return [HandlerMode.auto, HandlerMode.manual];
  }

  async handleAuto(payload: UserCreatedDomainEventPayload): Promise<UserChallengeTasksToBeClosed> {
    const { referrerId } = payload;
    if (!referrerId) return [];

    return this.handle(referrerId, payload);
  }

  async handleManual(payload: ManualChallengeTaskArgs): Promise<UserChallengeTasksToBeClosed> {
    const { user } = payload;

    return this.handle(user.id, user);
  }

  async handle(userId: string, payload: User | UserCreatedDomainEventPayload): Promise<UserChallengeTasksToBeClosed> {
    const userChallengeTasks = await this.prismaService.userChallengeTask.findMany({
      relationLoadStrategy: 'join',
      where: {
        status: UserChallengeTaskStatus.NOT_COMPLETED,
        userId: userId,
        task: {
          pattern: ChallengeTaskPattern.INVITE_USERS,
        },
      },
      include: {
        task: true,
      },
    });

    if (userChallengeTasks.length === 0) return [];

    const { countInvitedUsers } = await lastValueFrom(this.usersService.getCountInvitedUsersByUserId({ userId }));

    return userChallengeTasks.filter(
      (userChallengeTask) => this.isTaskPassed(countInvitedUsers, userChallengeTask.task.configuration as TInviteUsersPatternConfiguration)
    );
  }

  private isTaskPassed(countInvitedUsers: number, configuration: TInviteUsersPatternConfiguration) {
    const { amountInvited: needToInviteAmount } = configuration;

    return countInvitedUsers >= needToInviteAmount;
  }
}
