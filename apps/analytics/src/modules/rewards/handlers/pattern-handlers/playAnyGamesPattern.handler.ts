import { Injectable } from '@nestjs/common';
import { BetResultEnum, ChallengeTaskPattern, GameStateEnum, UserChallengeTaskStatus } from '@prisma/client';
import { BaseEvent } from '@xyro/libs/events';
import { ClassConstructor } from 'class-transformer';
import { LoggerService } from '@xyro/libs/logger';
import { UpDownGameChangedDomainEvent, UpDownGameChangedDomainEventPayload } from '@xyro/contracts/up-down';
import { SetupGameChangedDomainEvent, SetupGameChangedDomainEventPayload } from '@xyro/contracts/setups';
import { BullsEyeGameChangedDomainEvent, BullsEyeGameChangedDomainEventPayload } from '@xyro/contracts/bulls-eye';
import { X1000GameChangedDomainEvent, X1000GameChangedDomainEventPayload } from '@xyro/contracts/x1000';
import { OneVsOneGameChangedDomainEvent, OneVsOneGameChangedDomainEventPayload } from '@xyro/contracts/one-vs-one';

import { UserChallengeTasksToBeClosed, BasePatternHandler, HandlerMode, ManualChallengeTaskArgs } from '../basePatternHandler';
import { PrismaService } from '../../../../infrastructure/prisma';

type TPlayAnyGamesPatternConfiguration = {
  amountGames: number;
}

type PlayAnyGamesAutoHandlerPayload =
  UpDownGameChangedDomainEventPayload
  | SetupGameChangedDomainEventPayload
  | BullsEyeGameChangedDomainEventPayload
  | X1000GameChangedDomainEventPayload
  | OneVsOneGameChangedDomainEventPayload;

type UserCountGames = { ownerId: string; _count: number };

type IsTaskPassedParams = {
  userId: string;
  usersCountGames: UserCountGames[];
  configuration: TPlayAnyGamesPatternConfiguration;
};

@Injectable()
export class PlayAnyGamesPatternHandler extends BasePatternHandler<ChallengeTaskPattern> {
  constructor(
    private readonly logger: LoggerService,
    protected readonly prismaService: PrismaService,
  ) {
    super();
    this.logger.setContext(PlayAnyGamesPatternHandler.name);
  }

  public getDomainEventsTriggers(): ClassConstructor<BaseEvent<any>>[] {
    return [
      UpDownGameChangedDomainEvent,
      SetupGameChangedDomainEvent,
      BullsEyeGameChangedDomainEvent,
      X1000GameChangedDomainEvent,
      OneVsOneGameChangedDomainEvent,
    ];
  }

  public supportModes() {
    return [HandlerMode.auto, HandlerMode.manual];
  }

  async handleAuto(payload: PlayAnyGamesAutoHandlerPayload): Promise<UserChallengeTasksToBeClosed> {
    const { id, state } = payload;

    if (state !== GameStateEnum.CLOSE) return [];

    const bets = await this.prismaService.bet.findMany({
      where: {
        gameId: id,
      },
      select: {
        ownerId: true,
      }
    });

    return this.handle(bets.map((bet) => bet.ownerId));
  }

  async handleManual(payload: ManualChallengeTaskArgs): Promise<UserChallengeTasksToBeClosed> {
    const { user } = payload;

    return this.handle([user.id]);
  }

  async handle(userIds: string[]): Promise<UserChallengeTasksToBeClosed> {
    const userChallengeTasks = await this.prismaService.userChallengeTask.findMany({
      relationLoadStrategy: 'join',
      where: {
        status: UserChallengeTaskStatus.NOT_COMPLETED,
        userId: {
          in: userIds
        },
        task: {
          pattern: ChallengeTaskPattern.PLAY_ANY_GAME,
        },
      },
      include: {
        task: true,
      },
    });

    if (userChallengeTasks.length === 0) return [];

    const usersCountGames = await this.prismaService.bet.groupBy({
      _count: true,
      by: 'ownerId',
      where: {
        ownerId: {
          in: userIds,
        },
        result: {
          in: [BetResultEnum.LOSS, BetResultEnum.WON],
        }
      }
    });

    return userChallengeTasks.filter(
      (userChallengeTask) => this.isTaskPassed({
        userId: userChallengeTask.userId,
        usersCountGames,
        configuration: userChallengeTask.task.configuration as TPlayAnyGamesPatternConfiguration
      })
    );
  }

  private isTaskPassed(params: IsTaskPassedParams) {
    const { userId, usersCountGames, configuration } = params;
  
    const userCountGames = usersCountGames.find((userCountGames) => userCountGames.ownerId === userId)?._count ?? 0;

    const { amountGames: needToPlayedAmountGames } = configuration;

    return userCountGames >= needToPlayedAmountGames;
  }
}
