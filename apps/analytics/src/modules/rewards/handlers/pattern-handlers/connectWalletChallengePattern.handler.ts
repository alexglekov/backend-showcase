import { Injectable } from '@nestjs/common';
import { User, UserCreatedDomainEvent, UserUpdatedDomainEvent, UserUpdatedDomainEventPayload } from '@xyro/contracts/users';
import { ChallengeTaskPattern, UserChallengeTaskStatus } from '@prisma/client';
import { BaseEvent } from '@xyro/libs/events';
import { LoggerService } from '@xyro/libs/logger';
import { ClassConstructor } from 'class-transformer';

import { UserChallengeTasksToBeClosed, BasePatternHandler, HandlerMode, ManualChallengeTaskArgs } from '../basePatternHandler';
import { PrismaService } from '../../../../infrastructure/prisma';

@Injectable()
export class ConnectWalletChallengePatternHandler extends BasePatternHandler<ChallengeTaskPattern> {
  constructor(
    private readonly logger: LoggerService,
    protected readonly prismaService: PrismaService,
  ) {
    super();

    this.logger.setContext(ConnectWalletChallengePatternHandler.name);
  }

  public supportModes() {
    return [HandlerMode.auto, HandlerMode.manual];
  }

  public getDomainEventsTriggers(): ClassConstructor<BaseEvent<any>>[] {
    return [
      UserCreatedDomainEvent,
      UserUpdatedDomainEvent,
    ];
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
          pattern: ChallengeTaskPattern.CONNECT_WALLET_CHALLENGE,
        },
      },
    });

    if (userChallengeTasks.length === 0) return [];

    const isTaskPassed = await this.isTaskPassed(payload);

    if (!isTaskPassed) return [];

    return userChallengeTasks;
  }

  private isTaskPassed(user: User | UserUpdatedDomainEventPayload) {
    const { walletAddress } = user;

    if (!walletAddress) return false;

    return true;
  }
}
