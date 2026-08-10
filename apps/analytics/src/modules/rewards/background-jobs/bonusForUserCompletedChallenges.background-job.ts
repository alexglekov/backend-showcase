import {
  RewardUpdatedDomainEvent,
  UserChallengeTaskUpdatedDomainEvent,
  UserChallengeTaskUpdatedDomainEventPayload,
} from '@xyro/contracts/analytics';
import { EventPayload, EventsListener, DomainEventsPublisher, SubscribeDomainEvent } from '@xyro/libs/events';
import { RewardsLedgerService } from '@xyro/libs/ledger';
import { LoggerService } from '@xyro/libs/logger';
import { InternalServerErrorException } from '@nestjs/common';
import { Reward, UserChallengeTaskStatus } from '@prisma/client';
import { BalanceUpdatedDomainEvent } from '@xyro/contracts/ledger';
import Decimal from 'decimal.js';

import { PrismaService } from '../../../infrastructure/prisma';
import { bonusesByCountCompletedChallenges } from './constants';

@EventsListener()
export class BonusForUserCompletedChallengesBackgroundJob {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: LoggerService,
    private readonly domainEventsPublisher: DomainEventsPublisher,
    private readonly rewardsLedgerService: RewardsLedgerService,
  ) {}

  @SubscribeDomainEvent(UserChallengeTaskUpdatedDomainEvent)
  async onUserChallengeTaskUpdated(@EventPayload() payload: UserChallengeTaskUpdatedDomainEventPayload) {
    const { status, userId } = payload;

    // process only when the task status has changed to COMPLETED
    if (status !== UserChallengeTaskStatus.COMPLETED) return;

    const { countUserCompletedChallenges, userReward } = await this.getUserChallengesState(userId);

    if (countUserCompletedChallenges <= userReward.challengeBonusOffset) return;

    const {
      bonusAmount,
      newChallengesOffset,
    } = this.getBonusForCompletedChallenges(countUserCompletedChallenges, userReward);

    // skip if the user has not reached new heights
    if (newChallengesOffset === userReward.challengeBonusOffset) return;

    const {
      updatedBalance,
      updatedReward,
    } = await this.applyBonus(userReward, bonusAmount, newChallengesOffset);

    this.logger.log({
      action: 'User received a bonus for series completed challenges',
      payload: {
        newChallengesOffset,
        bonusAmount: Number(bonusAmount),
        userId: userReward.userId,
      }
    })

    await Promise.allSettled([
      this.domainEventsPublisher.publish(new RewardUpdatedDomainEvent(updatedReward)),
      this.domainEventsPublisher.publish(new BalanceUpdatedDomainEvent({
        accountId: updatedBalance.accountId!,
        amount: updatedBalance.amount,
        id: updatedBalance.id!,
        createdAt: updatedBalance.createdAt!,
      })),
    ]);
  }

  private async getUserChallengesState(userId: string) {
    const [
      grouppedChallengesTasksByChallengeIdAndStatus,
      userReward,
    ] = await Promise.all([
      this.prismaService.userChallengeTask.groupBy({
        by: ['challengeId', 'status', 'isActive'],
        where: {
          userId,
        },
      }),
      this.prismaService.reward.findFirst({
        where: {
          userId: userId,
        },
      }),
    ]);

    if (!userReward) {
      throw new InternalServerErrorException('User Reward not found.')
    }

    const challengesStatesMap = new Map<string, UserChallengeTaskStatus>();

    grouppedChallengesTasksByChallengeIdAndStatus.forEach((challengePartState) => {
      if (challengesStatesMap.get(challengePartState.challengeId) === UserChallengeTaskStatus.NOT_COMPLETED) return;
      if (challengePartState.isActive === false) {
        return challengesStatesMap.set(challengePartState.challengeId, UserChallengeTaskStatus.NOT_COMPLETED);
      }
      challengesStatesMap.set(challengePartState.challengeId, challengePartState.status);
    });

    const completedChallenges = Array
      .from(challengesStatesMap.values())
      .filter((challengesState) => challengesState !== UserChallengeTaskStatus.NOT_COMPLETED);

    return {
      countUserCompletedChallenges: completedChallenges.length,
      userReward,
    }
  }

  private getBonusForCompletedChallenges(countUserCompletedChallenges: number, userReward: Reward) {
    let newChallengesOffset = 0;
    let bonusAmount = new Decimal(0);

    bonusesByCountCompletedChallenges
      .filter((bonus) => bonus.countCompleted <= countUserCompletedChallenges
        && bonus.countCompleted > userReward.challengeBonusOffset)
      .forEach((bonus) => {
        newChallengesOffset = bonus.countCompleted;
        bonusAmount = bonusAmount.plus(bonus.amount)
      });

    return {
      newChallengesOffset,
      bonusAmount
    };
  }

  private async applyBonus(userReward: Reward, bonusAmount: Decimal, newChallengesOffset: number) {
    const {
      updatedReward,
      updatedBalance,
    } = await this.prismaService.$transaction(async (transaction) => {
      const [
        updatedReward,
        updatedBalance,
      ] = await Promise.all([
        transaction.reward.update({
          where: {
            id: userReward.id,
          },
          data: {
            rewards: {
              increment: bonusAmount,
            },
            challengeBonusOffset: newChallengesOffset,
          }
        }),
        this.rewardsLedgerService.addRewardToUserBalance({
          userId: userReward.userId,
          reward: bonusAmount,
          reason: `Reward for completing a series of ${newChallengesOffset} challenges`,
        }, transaction),
      ]);

      return {
        updatedReward,
        updatedBalance,
      }
    });

    return {
      updatedReward,
      updatedBalance,
    }
  }
}