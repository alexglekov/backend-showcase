import { Inject, Injectable } from '@nestjs/common';
import { ChallengeTaskPattern, UserChallengeTaskStatus } from '@prisma/client';
import { BaseEvent } from '@xyro/libs/events';
import { ClassConstructor } from 'class-transformer';
import { LoggerService } from '@xyro/libs/logger';
import { MessageCreatedDomainEvent, MessageCreatedDomainEventPayload, MessengerService } from '@xyro/contracts/messenger';
import { lastValueFrom } from 'rxjs';
import { AppsNames } from '@xyro/core';

import { UserChallengeTasksToBeClosed, BasePatternHandler, HandlerMode, ManualChallengeTaskArgs } from '../basePatternHandler';
import { PrismaService } from '../../../../infrastructure/prisma';

type TCreateChatMessagesPatternConfiguration = {
  messagesAmount: number;
}

type IsTaskPassedParams = {
  userMessagesAmount: number;
  configuration: TCreateChatMessagesPatternConfiguration;
};

@Injectable()
export class CreateChatMessagesPatternHandler extends BasePatternHandler<ChallengeTaskPattern> {
  constructor(
    @Inject(AppsNames.Messenger) private readonly messengerService: MessengerService,
    private readonly logger: LoggerService,
    protected readonly prismaService: PrismaService,
  ) {
    super();
    this.logger.setContext(CreateChatMessagesPatternHandler.name);
  }

  public getDomainEventsTriggers(): ClassConstructor<BaseEvent<any>>[] {
    return [
      MessageCreatedDomainEvent,
    ];
  }

  public supportModes() {
    return [HandlerMode.auto, HandlerMode.manual];
  }

  async handleAuto(payload: MessageCreatedDomainEventPayload): Promise<UserChallengeTasksToBeClosed> {
    const { senderId } = payload;

    return this.handle(senderId);
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
          pattern: ChallengeTaskPattern.CREATE_CHAT_MESSAGES,
        },
      },
      include: {
        task: true,
      },
    });

    if (userChallengeTasks.length === 0) return [];

    const { amount: userMessagesAmount } = await lastValueFrom(
      this.messengerService.getUserMessagesAmount({ userId }),
    )

    return userChallengeTasks.filter(
      (userChallengeTask) => this.isTaskPassed({
        userMessagesAmount,
        configuration: userChallengeTask.task.configuration as TCreateChatMessagesPatternConfiguration
      })
    );
  }

  private isTaskPassed(params: IsTaskPassedParams) {
    const { userMessagesAmount, configuration } = params;

    const { messagesAmount: needToSendMessagesAmount } = configuration;

    return userMessagesAmount >= needToSendMessagesAmount;
  }
}
