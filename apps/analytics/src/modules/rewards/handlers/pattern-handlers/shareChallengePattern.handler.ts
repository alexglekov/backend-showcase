import { Inject, Injectable } from '@nestjs/common';
import { User, UserUpdatedDomainEvent, UserUpdatedDomainEventPayload } from '@xyro/contracts/users';
import { ChallengeTaskPattern, UserChallengeTaskStatus } from '@prisma/client';
import { TwitterService } from '@xyro/contracts/twitter';
import { BaseEvent } from '@xyro/libs/events';
import { LoggerService } from '@xyro/libs/logger';
import { ClassConstructor } from 'class-transformer';
import { AppsNames } from '@xyro/core';
import { lastValueFrom } from 'rxjs';

import { UserChallengeTasksToBeClosed, BasePatternHandler, HandlerMode, ManualChallengeTaskArgs } from '../basePatternHandler';
import { PrismaService } from '../../../../infrastructure/prisma';

type TShareChallengePatternConfiguration = {
  tweetId: string;
}

type IsTaskPassedParams = {
  twitterId?: string;
  configuration: TShareChallengePatternConfiguration;
};

@Injectable()
export class ShareChallengePatternHandler extends BasePatternHandler<ChallengeTaskPattern> {
  constructor(
    @Inject(AppsNames.Twitter) private readonly usersSerivice: TwitterService,
    private readonly logger: LoggerService,
    protected readonly prismaService: PrismaService,
  ) {
    super();

    this.logger.setContext(ShareChallengePatternHandler.name);
  }

  public supportModes() {
    return [HandlerMode.auto, HandlerMode.manual];
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
      relationLoadStrategy: 'join',
      where: {
        status: UserChallengeTaskStatus.NOT_COMPLETED,
        userId: userId,
        task: {
          pattern: ChallengeTaskPattern.SHARE_CHALLENGE,
        },
      },
      include: {
        task: true,
      }
    });

    if (userChallengeTasks.length === 0) return [];

    const completedUserChallengeTasks: UserChallengeTasksToBeClosed = [];

    for (const userChallengeTask of userChallengeTasks) {
      try {
        const isTaskPassed = await this.isTaskPassed({
          twitterId: payload.twitterId,
          configuration: userChallengeTask.task.configuration as TShareChallengePatternConfiguration
        });

        if (isTaskPassed) completedUserChallengeTasks.push(userChallengeTask);
      } catch (error) {
        this.logger.error({
          action: 'Error occured on ShareChallengePatternHandler.isTaskPassed method',
          payload: {
            errorMessage: error.message,
            errorStack: error.stack,
            twitterId: payload.twitterId,
            userChallengeTaskId: userChallengeTask.id,
            configuration: userChallengeTask.task.configuration
          }
        });
      }
    }
    return completedUserChallengeTasks;
  }

  private async isTaskPassed(user: IsTaskPassedParams) {
    const { twitterId, configuration } = user;

    if (!twitterId) return false;

    const { isRetweeted } = await lastValueFrom(
      this.usersSerivice.isTweetRetweetedByAccount({ tweetId: configuration.tweetId, twitterId })
    );

    return isRetweeted;
  }
}
