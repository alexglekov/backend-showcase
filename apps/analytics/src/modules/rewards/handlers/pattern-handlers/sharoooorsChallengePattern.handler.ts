import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import { ChallengeTaskPattern, UserChallengeTaskStatus } from '@prisma/client';
import { BaseEvent } from '@xyro/libs/events';
import { LoggerService } from '@xyro/libs/logger';
import { ClassConstructor } from 'class-transformer';
import { TwitterService } from '@xyro/contracts/twitter';
import { AppsNames } from '@xyro/core';

import { UserChallengeTasksToBeClosed, BasePatternHandler, HandlerMode, ManualChallengeTaskArgs } from '../basePatternHandler';
import { PrismaService } from '../../../../infrastructure/prisma';
import { lastValueFrom } from 'rxjs';

type TSharoooorsChallengePatternConfiguration = {
  countLikesOnTweets?: number;
  countTweets?: number;
}

type IsTaskPassedParams = {
  countLikesOnTweets: number;
  countTweets: number;
  configuration: TSharoooorsChallengePatternConfiguration;
};

@Injectable()
export class SharoooorsChallengePatternHandler extends BasePatternHandler<ChallengeTaskPattern> {
  constructor(
    @Inject(AppsNames.Twitter) private readonly twitterService: TwitterService,
    private readonly logger: LoggerService,
    protected readonly prismaService: PrismaService,
  ) {
    super();

    this.logger.setContext(SharoooorsChallengePatternHandler.name);
  }

  public supportModes() {
    return [HandlerMode.auto, HandlerMode.manual];
  }

  public getDomainEventsTriggers(): ClassConstructor<BaseEvent<any>>[] {
    return [];
  }

  async handleAuto(payload: unknown): Promise<UserChallengeTasksToBeClosed> {
    throw new NotImplementedException('Auto check for SharoooorsChallengePatternHandler not allowed.');
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
        userId: userId,
        task: {
          pattern: ChallengeTaskPattern.SHAROOOORS_CHALLENGE,
        },
      },
      include: {
        task: true,
      }
    });

    if (userChallengeTasks.length === 0) return [];

    try {
      const { countLikesOnTweets, countTweets } = await lastValueFrom(
        this.twitterService.countAccountTweetsAndLikesOnTweets({ mentions: ['xyro_io'], twitterId, })
      );

      this.logger.log({
        action: 'User tried complete Sharoooors tasks',
        payload: {
          twitterId,
          userId,
          countLikesOnTweets,
          countTweets,
        }
      });

      return userChallengeTasks.filter(
        (userChallengeTask) => this.isTaskPassed({
          countLikesOnTweets,
          countTweets,
          configuration: userChallengeTask.task.configuration as TSharoooorsChallengePatternConfiguration
        })
      );
    }  catch (error) {
      this.logger.error({
        action: 'Error occured on SharoooorsChallengePatternHandler.handle method',
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
    const { countLikesOnTweets, countTweets, configuration } = params;

    if (configuration.countLikesOnTweets && configuration.countLikesOnTweets > countLikesOnTweets) return false;
    if (configuration.countTweets && configuration.countTweets > countTweets) return false;

    return true;
  }
}
