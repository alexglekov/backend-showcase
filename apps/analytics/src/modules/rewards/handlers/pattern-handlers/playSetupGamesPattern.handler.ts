import { Injectable } from '@nestjs/common';
import { ChallengeTaskPattern, GameStateEnum, UserChallengeTaskStatus } from '@prisma/client';
import { BaseEvent } from '@xyro/libs/events';
import { ClassConstructor } from 'class-transformer';
import { LoggerService } from '@xyro/libs/logger';
import { SetupGameChangedDomainEvent, SetupGameChangedDomainEventPayload } from '@xyro/contracts/setups';
import { sumBy } from 'lodash';

import { UserChallengeTasksToBeClosed, BasePatternHandler, HandlerMode, ManualChallengeTaskArgs } from '../basePatternHandler';
import { PrismaService } from '../../../../infrastructure/prisma';

type TPlaySetupGamesPatternConfiguration = {
  likeInfluenser: boolean;
  finishGamesAmount?: number;
  setupPoolSize?: number;
};

type UserGameInfo = { gameId: string; _count: number };

type IsTaskPassedParams = {
  userGamesInfos: UserGameInfo[];
  configuration: TPlaySetupGamesPatternConfiguration;
};

@Injectable()
export class PlaySetupGamesPatternHandler extends BasePatternHandler<ChallengeTaskPattern> {
  constructor(
    private readonly logger: LoggerService,
    protected readonly prismaService: PrismaService,
  ) {
    super();
    this.logger.setContext(PlaySetupGamesPatternHandler.name);
  }

  public getDomainEventsTriggers(): ClassConstructor<BaseEvent<any>>[] {
    return [
      SetupGameChangedDomainEvent
    ];
  }

  public supportModes() {
    return [HandlerMode.auto, HandlerMode.manual];
  }

  async handleAuto(payload: SetupGameChangedDomainEventPayload): Promise<UserChallengeTasksToBeClosed> {
    const { ownerId, state } = payload;

    if (state !== GameStateEnum.CLOSE) return [];

    return this.handle(ownerId);
  }

  async handleManual(payload: ManualChallengeTaskArgs): Promise<UserChallengeTasksToBeClosed> {
    const { user } = payload;

    return this.handle(user.id);
  }

  async handle(userId: string): Promise<UserChallengeTasksToBeClosed> {
    const userChallengeTasks = await this.prismaService.userChallengeTask.findMany({
      relationLoadStrategy: 'join',
      where: {
        status: UserChallengeTaskStatus.NOT_COMPLETED,
        userId,
        task: {
          pattern: ChallengeTaskPattern.PLAY_SETUP_GAMES,
        },
      },
      include: {
        task: true,
      },
    });

    if (userChallengeTasks.length === 0) return [];

    const userGamesInfos = await this.prismaService.betSetup.groupBy({
      _count: true,
      by: ['gameId'],
      where: {
        game: {
          ownerId: userId,
        },
      }
    });

    return userChallengeTasks.filter(
      (userChallengeTask) => this.isTaskPassed({
        userGamesInfos,
        configuration: userChallengeTask.task.configuration as TPlaySetupGamesPatternConfiguration
      })
    );
  }

  private isTaskPassed(params: IsTaskPassedParams) {
    const { userGamesInfos, configuration } = params;

    const betsCount = sumBy(userGamesInfos, (gameInfo) => gameInfo._count ?? 0);

    if (configuration.finishGamesAmount && configuration.finishGamesAmount > userGamesInfos.length) return false;
    if (configuration.setupPoolSize && configuration.setupPoolSize > betsCount) return false;

    return true;
  }
}
