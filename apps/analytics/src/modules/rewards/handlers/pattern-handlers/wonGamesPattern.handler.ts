import { Injectable } from '@nestjs/common';
import { BetResultEnum, ChallengeTaskPattern, GameStateEnum, GameTypeEnum, UserChallengeTaskStatus } from '@prisma/client';
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

type TWonGamesPatternConfiguration = {
  anyGamesAmount?: number;
  setupGamesAmount?: number;
  oneVsOneGamesAmount?: {
    likeOppenent: boolean;
    likeOwner: boolean;
    amount: number;
  };
  upDownGamesAmount?: number;
  x1000GamesAmount?: number;
  bullsEyeGamesAmount?: number;
}

type WonGamesAutoHandlerPayload =
  UpDownGameChangedDomainEventPayload
  | SetupGameChangedDomainEventPayload
  | BullsEyeGameChangedDomainEventPayload
  | X1000GameChangedDomainEventPayload
  | OneVsOneGameChangedDomainEventPayload;

type UserCountGames = { ownerId: string; _count: number; };
type UserCountGamesWithGameType = UserCountGames & { gameType: GameTypeEnum; };

type IsTaskPassedParams = {
  userId: string;
  usersCountGames: {
    aggregatedUsersCountGames: UserCountGamesWithGameType[];
    usersCountOneVsOneOwnedGames: UserCountGames[];
  };
  configuration: TWonGamesPatternConfiguration;
};

@Injectable()
export class WonGamesPatternHandler extends BasePatternHandler<ChallengeTaskPattern> {
  constructor(
    private readonly logger: LoggerService,
    protected readonly prismaService: PrismaService,
  ) {
    super();
    this.logger.setContext(WonGamesPatternHandler.name);
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

  async handleAuto(payload: WonGamesAutoHandlerPayload): Promise<UserChallengeTasksToBeClosed> {
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
          pattern: ChallengeTaskPattern.WON_GAMES,
        },
      },
      include: {
        task: true,
      },
    });

    if (userChallengeTasks.length === 0) return [];

    const usersCountGames = await this.prismaService.bet.groupBy({
      _count: true,
      by: ['ownerId', 'gameType'],
      where: {
        ownerId: {
          in: userIds,
        },
        result: BetResultEnum.WON,
      }
    });

    const usersCountOneVsOneOwnedGames = await this.prismaService.bet1vs1.groupBy({
      _count: true,
      by: 'ownerId',
      where: {
        ownerId: {
          in: userIds,
        },
        result: BetResultEnum.WON,
        game: {
          ownerId: {
            in: userIds,
          },
        }
      }
    });

    return userChallengeTasks.filter(
      (userChallengeTask) => this.isTaskPassed({
        userId: userChallengeTask.userId,
        usersCountGames: {
          aggregatedUsersCountGames: usersCountGames,
          usersCountOneVsOneOwnedGames,
        },
        configuration: userChallengeTask.task.configuration as TWonGamesPatternConfiguration
      })
    );
  }

  private isTaskPassed(params: IsTaskPassedParams) {
    const { userId, usersCountGames, configuration } = params;

    const { aggregatedUsersCountGames, usersCountOneVsOneOwnedGames } = usersCountGames;

    const userCountUpDownGames = aggregatedUsersCountGames
      .find((userCountGames) => userCountGames.ownerId === userId && userCountGames.gameType === GameTypeEnum.UPDOWN)?._count ?? 0;
    const userCountBullsEyeGames = aggregatedUsersCountGames
      .find((userCountGames) => userCountGames.ownerId === userId && userCountGames.gameType === GameTypeEnum.BULLSEYE)?._count ?? 0;
    const userCountSetupGames = aggregatedUsersCountGames
      .find((userCountGames) => userCountGames.ownerId === userId && userCountGames.gameType === GameTypeEnum.SETUP)?._count ?? 0;
    const userCountOneVsOneGames = aggregatedUsersCountGames
      .find((userCountGames) => userCountGames.ownerId === userId && userCountGames.gameType === GameTypeEnum.ONEVSONE)?._count ?? 0;
    const userCountX1000Games = aggregatedUsersCountGames
      .find((userCountGames) => userCountGames.ownerId === userId && userCountGames.gameType === GameTypeEnum.X1000)?._count ?? 0;

    const totalUserCountGames = userCountUpDownGames
      + userCountBullsEyeGames
      + userCountSetupGames
      + userCountOneVsOneGames
      + userCountX1000Games;

    if (configuration.anyGamesAmount && configuration.anyGamesAmount > totalUserCountGames) return false;
    if (configuration.upDownGamesAmount && configuration.upDownGamesAmount > userCountUpDownGames) return false;
    if (configuration.bullsEyeGamesAmount && configuration.bullsEyeGamesAmount > userCountBullsEyeGames) return false;
    if (configuration.setupGamesAmount && configuration.setupGamesAmount > userCountSetupGames) return false;
    if (configuration.x1000GamesAmount && configuration.x1000GamesAmount > userCountX1000Games) return false;

    if (
      configuration.oneVsOneGamesAmount
      && configuration.oneVsOneGamesAmount.likeOppenent
      && configuration.oneVsOneGamesAmount.amount > userCountOneVsOneGames
    ) return false;

    const userCountOneVsOneOwnedGames = usersCountOneVsOneOwnedGames.find((userCountGames) => userCountGames.ownerId === userId)?._count ?? 0;

    if (
      configuration.oneVsOneGamesAmount
      && configuration.oneVsOneGamesAmount.likeOwner
      && configuration.oneVsOneGamesAmount.amount > userCountOneVsOneOwnedGames
    ) return false;

    return true;
  }
}
