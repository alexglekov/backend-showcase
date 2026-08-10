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
import Decimal from 'decimal.js';

type TWhaleSquadPatternConfiguration = {
  totalBetsAmount: number;
  wonAmount: number;
}

type WhaleSquadAutoHandlerPayload =
  UpDownGameChangedDomainEventPayload
  | SetupGameChangedDomainEventPayload
  | BullsEyeGameChangedDomainEventPayload
  | X1000GameChangedDomainEventPayload
  | OneVsOneGameChangedDomainEventPayload;

type UsersTotalBetAmounts = { ownerId: string; _sum: { amount: Decimal | null } };
type UsersTotalWonAmounts = { ownerId: string; _sum: { pnl: Decimal | null } };

type IsTaskPassedParams = {
  userId: string;
  usersTotalBetAmounts: UsersTotalBetAmounts[];
  usersTotalWonAmounts: UsersTotalWonAmounts[];
  configuration: TWhaleSquadPatternConfiguration;
};

@Injectable()
export class WhaleSquadPatternHandler extends BasePatternHandler<ChallengeTaskPattern> {
  constructor(
    private readonly logger: LoggerService,
    protected readonly prismaService: PrismaService,
  ) {
    super();
    this.logger.setContext(WhaleSquadPatternHandler.name);
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

  async handleAuto(payload: WhaleSquadAutoHandlerPayload): Promise<UserChallengeTasksToBeClosed> {
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
          pattern: ChallengeTaskPattern.WHALE_SQUAD,
        },
      },
      include: {
        task: true,
      },
    });

    if (userChallengeTasks.length === 0) return [];

    const usersTotalWonAmounts = await this.prismaService.bet.groupBy({
      _sum: {
        pnl: true,
      },
      by: ['ownerId'],
      where: {
        ownerId: {
          in: userIds,
        },
        result: BetResultEnum.WON,
      }
    });

    const usersTotalBetAmounts = await this.prismaService.bet.groupBy({
      _sum: {
        amount: true,
      },
      by: ['ownerId'],
      where: {
        ownerId: {
          in: userIds,
        },
        result: {
          in: [BetResultEnum.WON, BetResultEnum.LOSS],
        }
      }
    });

    return userChallengeTasks.filter(
      (userChallengeTask) => this.isTaskPassed({
        userId: userChallengeTask.userId,
        usersTotalWonAmounts,
        usersTotalBetAmounts,
        configuration: userChallengeTask.task.configuration as TWhaleSquadPatternConfiguration
      })
    );
  }

  private isTaskPassed(params: IsTaskPassedParams) {
    const { userId, usersTotalBetAmounts, usersTotalWonAmounts, configuration } = params;

    const userTotalBetsAmount = Number(usersTotalBetAmounts.find((userCountGames) => userCountGames.ownerId === userId)?._sum?.amount ?? 0);
    const userTotalWonAmount = Number(usersTotalWonAmounts.find((userCountGames) => userCountGames.ownerId === userId)?._sum?.pnl ?? 0);

    if (configuration.totalBetsAmount > userTotalBetsAmount) return false;
    if (configuration.wonAmount > userTotalWonAmount) return false;

    return true;
  }
}
