import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User, UserUpdatedDomainEvent, UserUpdatedDomainEventPayload } from '@xyro/contracts/users';
import { ChallengeTaskPattern, UserChallengeTaskStatus } from '@prisma/client';
import { BaseEvent } from '@xyro/libs/events';
import { LoggerService } from '@xyro/libs/logger';
import { ClassConstructor } from 'class-transformer';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

import { Config } from '../../../../infrastructure/config';
import { UserChallengeTasksToBeClosed, BasePatternHandler, HandlerMode, ManualChallengeTaskArgs } from '../basePatternHandler';
import { PrismaService } from '../../../../infrastructure/prisma';

const DISCORD_URI = 'https://discord.com';

@Injectable()
export class CommunityChallengePatternHandler extends BasePatternHandler<ChallengeTaskPattern> {
  constructor(
    private readonly logger: LoggerService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<Config>,
    protected readonly prismaService: PrismaService,
  ) {
    super();

    this.logger.setContext(CommunityChallengePatternHandler.name);
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
      where: {
        status: UserChallengeTaskStatus.NOT_COMPLETED,
        userId,
        task: {
          pattern: ChallengeTaskPattern.COMMUNITY_CHALLENGE,
        },
      },
    });

    if (userChallengeTasks.length === 0) return [];

    const isTaskPassed = await this.isTaskPassed(payload);

    if (!isTaskPassed) return [];

    return userChallengeTasks;
  }

  private async isTaskPassed(user: User | UserUpdatedDomainEventPayload) {
    const { discordId } = user;

    if (!discordId) return false;

    const isUserInGuild = await this.checkUserInGuild(discordId);

    return isUserInGuild;
  }

  private async checkUserInGuild(discordId: string): Promise<boolean> {
    const { guildId, botToken } = this.configService.get('discord');

    try {
      const { data: discordGuildMemberData } = await lastValueFrom(
        this.httpService.get(`${DISCORD_URI}/api/v9/guilds/${guildId}/members/${discordId}`, {
          headers: {
            Authorization: `Bot ${botToken}`,
          },
        }),
      );
      return Boolean(discordGuildMemberData);
    } catch (error) {
      throw new InternalServerErrorException('Something went wrong.');
    }
  }
}
