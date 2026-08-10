import { Inject, Injectable } from '@nestjs/common';
import { User, UserUpdatedDomainEvent, UserUpdatedDomainEventPayload } from '@xyro/contracts/users';
import { TwitterService } from '@xyro/contracts/twitter';
import { ChallengeTaskPattern, UserChallengeTaskStatus } from '@prisma/client';
import { BaseEvent } from '@xyro/libs/events';
import { LoggerService } from '@xyro/libs/logger';
import { ClassConstructor } from 'class-transformer';
import { AppsNames } from '@xyro/core';
import { lastValueFrom } from 'rxjs';

import { UserChallengeTasksToBeClosed, BasePatternHandler, HandlerMode, ManualChallengeTaskArgs } from '../basePatternHandler';
import { PrismaService } from '../../../../infrastructure/prisma';

@Injectable()
export class ConnectWithXPatternHandler extends BasePatternHandler<ChallengeTaskPattern> {
  constructor(
    @Inject(AppsNames.Twitter) private readonly twitterService: TwitterService,
    private readonly logger: LoggerService,
    protected readonly prismaService: PrismaService,
  ) {
    super();

    this.logger.setContext(ConnectWithXPatternHandler.name);
  }

  public supportModes() {
    return [HandlerMode.manual, HandlerMode.auto];
  }

  public getDomainEventsTriggers(): ClassConstructor<BaseEvent<any>>[] {
    return [UserUpdatedDomainEvent];
  }

  async handleAuto(payload: UserUpdatedDomainEventPayload): Promise<UserChallengeTasksToBeClosed> {
    return this.handle(payload.id, payload);
  }

  async handleManual(payload: ManualChallengeTaskArgs): Promise<UserChallengeTasksToBeClosed> {
    const { user } = payload;

    return this.handle(user.id, user);
  }

  async handle(userId: string, payload: User | UserUpdatedDomainEventPayload): Promise<UserChallengeTasksToBeClosed> {
    const userChallengeTasks = await this.prismaService.userChallengeTask.findMany({
      where: {
        status: UserChallengeTaskStatus.NOT_COMPLETED,
        userId: userId,
        task: {
          pattern: ChallengeTaskPattern.CONNECT_WITH_X,
        },
      },
    });

    if (userChallengeTasks.length === 0) return [];

    const isTaskPassed = await this.isTaskPassed(payload);

    if (!isTaskPassed) return [];

    return userChallengeTasks;
  }

  private async isTaskPassed(user: User | UserUpdatedDomainEventPayload) {
    const { twitterId } = user;

    if (!twitterId) return false;

    try {
      const twitterAccount = await lastValueFrom(
        this.twitterService.getAccountById({ twitterId })
      );
      if (!twitterAccount) return false;
    } catch {
      return false;
    }

    return true;
  }
}
