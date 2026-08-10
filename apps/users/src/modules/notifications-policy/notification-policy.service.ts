import { Injectable } from '@nestjs/common';
import { EmailNotificationPolicy } from '@prisma/client';

import { DBTransaction, PrismaService } from '../../infrastructure/prisma';
import { ChangeEmailNotificationPolicyInput } from './types/notification-policy.input.types';

@Injectable()
export class NotificationPolicyService {
  constructor(private readonly prismaService: PrismaService) {}

  public async createNotificationPolicy(
    userId: string,
    dbTransaction?: DBTransaction,
  ): Promise<EmailNotificationPolicy> {
    const source = dbTransaction ?? this.prismaService;

    return source.emailNotificationPolicy.create({
      data: {
        userId,
      },
    });
  }

  async updateNotificationPolicy(
    userId: string,
    changes: ChangeEmailNotificationPolicyInput,
  ): Promise<EmailNotificationPolicy> {
    const existingNotificationsPolicy = await this.getNotificationPolicies(userId);

    if (typeof changes.sendNotificationsToEmail === 'boolean') {
      existingNotificationsPolicy.sendNotificationsToEmail =
        changes.sendNotificationsToEmail;

      if (!changes.sendNotificationsToEmail) {
        existingNotificationsPolicy.notifyBetsResult = false;
        existingNotificationsPolicy.notifyBettingInvitation = false;
        existingNotificationsPolicy.notifyNewAchievements = false;
        existingNotificationsPolicy.notifyUpdates = false;
      }
    }

    if (typeof changes.notifyBetsResult === 'boolean') {
      existingNotificationsPolicy.notifyBetsResult = changes.notifyBetsResult;
    }

    if (typeof changes.notifyBettingInvitation === 'boolean') {
      existingNotificationsPolicy.notifyBettingInvitation =
        changes.notifyBettingInvitation;
    }

    if (typeof changes.notifyNewAchievements === 'boolean') {
      existingNotificationsPolicy.notifyNewAchievements =
        changes.notifyNewAchievements;
    }

    if (typeof changes.notifyUpdates === 'boolean') {
      existingNotificationsPolicy.notifyUpdates = changes.notifyUpdates;
    }

    return this.prismaService.emailNotificationPolicy.update({
      where: { userId },
      data: existingNotificationsPolicy,
    });
  }

  async getNotificationPolicies(
    userId: string,
  ): Promise<Record<string, boolean>> {
    return this.prismaService.emailNotificationPolicy.findUniqueOrThrow({
      where: { userId },
      select: {
        notifyBetsResult: true,
        notifyBettingInvitation: true,
        notifyNewAchievements: true,
        notifyUpdates: true,
        sendNotificationsToEmail: true,
      }
    });
  }

  async checkNotificationPolicies(
    userId: string,
    policyKeys: string[],
  ): Promise<boolean> {
    const userPolicies = await this.getNotificationPolicies(userId);

    return policyKeys.every((key) => userPolicies[key]);
  }
}
