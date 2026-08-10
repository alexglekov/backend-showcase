import { Injectable } from '@nestjs/common';
import { PrivacyPolicy } from '@prisma/client';
import { PrivacyPolicies } from '@xyro/core';

import { DBTransaction, PrismaService } from '../../infrastructure/prisma';
import { ChangePrivacyPolicyInput } from './types/privacy.input.types';

@Injectable()
export class PrivacyService {
  constructor(
    private readonly prismaService: PrismaService
  ) {}

  public async createPolicy(
    userId: string,
    dbTransaction?: DBTransaction,
  ): Promise<PrivacyPolicy> {
    const source = dbTransaction ?? this.prismaService;

    return source.privacyPolicy.create({
      data: {
        userId,
      },
    });
  }

  async updatePolicy(
    userId: string,
    changes: ChangePrivacyPolicyInput,
  ): Promise<PrivacyPolicy> {
    const existingPolicy = await this.getPolicyPolicies(userId);

    if (typeof changes.showProfile === 'boolean') {
      existingPolicy.showProfile = changes.showProfile;

      if (!changes.showProfile) {
        existingPolicy.showAchievements = false;
        existingPolicy.showSetups = false;
        existingPolicy.showStats = false;
        existingPolicy.showBettingHistory = false;
        existingPolicy.allowInviteIn1vs1Game = false;
        existingPolicy.allowTagInChat = false;
      }
    }

    if (typeof changes.showAchievements === 'boolean') {
      existingPolicy.showAchievements = changes.showAchievements;
    }

    if (typeof changes.showSetups === 'boolean') {
      existingPolicy.showSetups = changes.showSetups;
    }

    if (typeof changes.showStats === 'boolean') {
      existingPolicy.showStats = changes.showStats;
    }

    if (typeof changes.showBettingHistory === 'boolean') {
      existingPolicy.showBettingHistory = changes.showBettingHistory;
    }

    if (typeof changes.allowInviteIn1vs1Game === 'boolean') {
      existingPolicy.allowInviteIn1vs1Game = changes.allowInviteIn1vs1Game;
    }

    if (typeof changes.allowTagInChat === 'boolean') {
      existingPolicy.allowTagInChat = changes.allowTagInChat;
    }

    return this.prismaService.privacyPolicy.update({
      where: { userId },
      data: existingPolicy,
    });
  }

  async getPolicyPolicies(userId: string): Promise<PrivacyPolicy> {
    return this.prismaService.privacyPolicy.findUniqueOrThrow({
      where: { userId },
    });
  }

  async checkPolicies(
    userId: string,
    policyKeys: PrivacyPolicies[],
  ): Promise<boolean> {
    const userPolicies = await this.getPolicyPolicies(userId);

    return policyKeys.every((key) => userPolicies[key]);
  }

  async checkPoliciesBatch(
    userIds: string[],
    policyKeys: PrivacyPolicies[],
  ): Promise<string[]> {
    const usersPolicies = await this.prismaService.privacyPolicy.findMany({
      where: {
        userId: {
          in: userIds,
        },
      },
    });

    return usersPolicies
      .filter((userPolicies) => policyKeys.every((key) => userPolicies[key]))
      .map((userPolicies) => userPolicies.userId);
  }
}
