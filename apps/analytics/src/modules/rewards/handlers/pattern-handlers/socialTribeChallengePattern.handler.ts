import { Inject, Injectable } from '@nestjs/common';
import { ChallengeTaskPattern, UserChallengeTaskStatus } from '@prisma/client';
import { BaseEvent } from '@xyro/libs/events';
import { ClassConstructor } from 'class-transformer';
import { LoggerService } from '@xyro/libs/logger';
import {
  SessionCreatedDomainEvent,
  SessionCreatedDomainEventPayload,
  SessionRefreshedDomainEvent,
  SessionRefreshedDomainEventPayload,
  UserCreatedDomainEvent,
  UserCreatedDomainEventPayload,
  UserUpdatedDomainEvent,
  UserUpdatedDomainEventPayload,
  UsersService
} from '@xyro/contracts/users';
import { lastValueFrom } from 'rxjs';
import { TwitterService } from '@xyro/contracts/twitter';
import { AppsNames } from '@xyro/core';

import { UserChallengeTasksToBeClosed, BasePatternHandler, HandlerMode, ManualChallengeTaskArgs } from '../basePatternHandler';
import { PrismaService } from '../../../../infrastructure/prisma';

type TSocialTribeChallengePatternConfiguration = {
  dailyLoginAmout: number;
  postsLikesAmount: number;
  discordRoleId?: string;
};

type IsTaskPassedParams = {
  countDailyLogins: number;
  countLikedTweets: number;
  configuration: TSocialTribeChallengePatternConfiguration;
};

@Injectable()
export class SocialTribeChallengePatternHandler extends BasePatternHandler<ChallengeTaskPattern> {
  constructor(
    @Inject(AppsNames.Users) private readonly usersService: UsersService,
    @Inject(AppsNames.Twitter) private readonly twitterService: TwitterService,
    private readonly logger: LoggerService,
    protected readonly prismaService: PrismaService,
  ) {
    super();
    this.logger.setContext(SocialTribeChallengePatternHandler.name);
  }

  public getDomainEventsTriggers(): ClassConstructor<BaseEvent<any>>[] {
    return [
      SessionRefreshedDomainEvent,
      SessionCreatedDomainEvent,
      UserUpdatedDomainEvent,
      UserCreatedDomainEvent,
    ];
  }

  public supportModes() {
    return [HandlerMode.auto, HandlerMode.manual];
  }

  async handleAuto(
    payload:
      | SessionCreatedDomainEventPayload
      | UserUpdatedDomainEventPayload
      | UserCreatedDomainEventPayload
      | SessionRefreshedDomainEventPayload
  ): Promise<UserChallengeTasksToBeClosed> {
    if (
      payload instanceof SessionCreatedDomainEventPayload
      || payload instanceof SessionRefreshedDomainEventPayload
    ) {
      const user = await lastValueFrom(this.usersService.getUserById({ userId: payload.userId }));

      return this.handle(payload.userId, user.twitterId);
    }

    return this.handle(payload.id, payload.twitterId);
  }

  async handleManual(payload: ManualChallengeTaskArgs): Promise<UserChallengeTasksToBeClosed> {
    const { user } = payload;

    return this.handle(user.id, user.twitterId);
  }

  async handle(userId: string, twitterId?: string): Promise<UserChallengeTasksToBeClosed> {
    if (!twitterId) return [];

    const userChallengeTasks = await this.prismaService.userChallengeTask.findMany({
      relationLoadStrategy: 'join',
      where: {
        status: UserChallengeTaskStatus.NOT_COMPLETED,
        userId,
        task: {
          pattern: ChallengeTaskPattern.SOCIAL_TRIBE_CHALLENGE,
        },
      },
      include: {
        task: true,
      },
    });

    if (userChallengeTasks.length === 0) return [];

    try {
      const [
        { countDailyLogins },
        { countLikedTweets },
      ] = await Promise.all([
        lastValueFrom(this.usersService.getCountUserDailyLogins({ userId })),
        lastValueFrom(this.twitterService.countLikedTweetsByAccount({ twitterId }))
      ]);

      this.logger.log({
        action: 'User tried complete Social Tribe tasks',
        payload: {
          twitterId,
          userId,
          countDailyLogins,
          countLikedTweets,
        }
      });

      return userChallengeTasks.filter(
        (userChallengeTask) => this.isTaskPassed({
          countDailyLogins,
          countLikedTweets,
          configuration: userChallengeTask.task.configuration as TSocialTribeChallengePatternConfiguration
        })
      );
    } catch (error) {
      this.logger.error({
        action: 'Error occured on SocialTribeChallengePatternHandler.handle method',
        payload: {
          userId,
          twitterId,
          errorMessage: error.message,
          errorStack: error.stack,
        }
      });
      return [];
    }
  }

  private isTaskPassed(params: IsTaskPassedParams) {
    const { countDailyLogins, countLikedTweets, configuration } = params;

    if (configuration.dailyLoginAmout && configuration.dailyLoginAmout > countDailyLogins) return false;
    if (configuration.postsLikesAmount && configuration.postsLikesAmount > countLikedTweets) return false;

    return true;
  }
}
