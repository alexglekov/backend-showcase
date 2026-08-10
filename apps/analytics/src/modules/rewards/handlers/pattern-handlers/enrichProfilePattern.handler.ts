import { Injectable } from '@nestjs/common';
import { User, UserUpdatedDomainEvent, UserUpdatedDomainEventPayload } from '@xyro/contracts/users';
import { ChallengeTaskPattern, UserChallengeTaskStatus } from '@prisma/client';
import { BaseEvent } from '@xyro/libs/events';
import { ClassConstructor } from 'class-transformer';
import { LoggerService } from '@xyro/libs/logger';

import { UserChallengeTasksToBeClosed, BasePatternHandler, HandlerMode, ManualChallengeTaskArgs } from '../basePatternHandler';
import { PrismaService } from '../../../../infrastructure/prisma';

@Injectable()
export class EnrichProfilePatternHandler extends BasePatternHandler<ChallengeTaskPattern> {
  constructor(
    private readonly logger: LoggerService,
    protected readonly prismaService: PrismaService,
  ) {
    super();

    this.logger.setContext(EnrichProfilePatternHandler.name);
  }

  public getDomainEventsTriggers(): ClassConstructor<BaseEvent<any>>[] {
    return [UserUpdatedDomainEvent];
  }

  public supportModes() {
    return [HandlerMode.auto, HandlerMode.manual];
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
          pattern: ChallengeTaskPattern.ENRICH_PROFILE,
        },
      },
    });

    if (userChallengeTasks.length === 0) return [];

    const isTaskPassed = await this.isTaskPassed(payload);

    if (!isTaskPassed) return [];

    return userChallengeTasks;
  }

  private isTaskPassed(payload: User | UserUpdatedDomainEventPayload) {
    const { bio, avatarKeys, name } = payload;

    if (!bio || avatarKeys.length === 0 || !name) return false;

    if (bio.length < 80) return false;

    return true;
  }
}
