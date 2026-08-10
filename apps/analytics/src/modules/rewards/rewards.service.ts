import {
  RewardUpdatedDomainEvent,
  UserChallengeTaskUpdatedDomainEvent,
} from '@xyro/contracts/analytics';
import { UserChallengeTask, UserChallengeTaskStatus } from '@prisma/client';
import { AppsNames } from '@xyro/core';
import { UsersService } from '@xyro/contracts/users';
import { BalanceUpdatedDomainEvent } from '@xyro/contracts/ledger';
import { lastValueFrom } from 'rxjs';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DomainEventsPublisher } from '@xyro/libs/events';
import { LoggerService } from '@xyro/libs/logger';
import { RewardsLedgerService } from '@xyro/libs/ledger';
import { RedisService } from '@xyro/libs/redis';

import { PrismaService } from '../../infrastructure/prisma';
import { ChallengeTasksHandler } from './handlers/challengeTaskHandler';
import { ManualChallengeTaskArgs } from './handlers/basePatternHandler';

interface GetUserSeasonStateParams {
  userId: string;
}

interface GetUserRewardsParams {
  userId: string;
}

interface GetTopUsersRewardsParams {
  userId: string;
}

interface ClaimRewardParams {
  userId: string;
  userTaskId: string;
}

interface CheckChallengeTaskCompletionParams {
  userId: string;
  userTaskId: string;
}

const LAST_PLACE_ON_TOP_USERS_REWARDS_TABLE = 10;

const LAST_PLACE_ON_LEADERBOAD_TTL_IN_SEC = 60;
const LAST_PLACE_ON_LEADERBOAD_TTL_CACHE_KEY = 'lastPlaceOnLeaderboard';

@Injectable()
export class RewardsService {
  constructor(
    @Inject(AppsNames.Users) private readonly usersService: UsersService,
    private readonly prismaService: PrismaService,
    private readonly logger: LoggerService,
    private readonly domainEventsPublisher: DomainEventsPublisher,
    private readonly rewardsLedgerService: RewardsLedgerService,
    private readonly redisService: RedisService,
    private readonly challengeTasksHandler: ChallengeTasksHandler,
  ) {
    this.logger.setContext(RewardsService.name);
  }

  async checkChallengeTaskCompletion(params: CheckChallengeTaskCompletionParams) {
    const userChallengeTask = await this.prismaService.userChallengeTask.findFirst({
      where: {
        id: params.userTaskId,
      },
      include: {
        task: {
          select: {
            pattern: true,
          }
        },
      }
    });

    if (!userChallengeTask) {
      throw new BadRequestException('Challenge task not found.');
    }

    const user = await lastValueFrom(this.usersService.getUserById({ userId: params.userId }));

    const payload: ManualChallengeTaskArgs = { user };

    await this.challengeTasksHandler.handleByPatternManual(userChallengeTask.task.pattern, payload);

    return this.getUserSeasonState(params);
  }

  async claimReward(params: ClaimRewardParams): Promise<UserChallengeTask> {
    const userChallengeTask = await this.prismaService.userChallengeTask.findFirst({
      where: {
        userId: params.userId,
        id: params.userTaskId,
        status: UserChallengeTaskStatus.COMPLETED,
      },
      select: {
        id: true,
        challenge: {
          select: {
            number: true,
          }
        },
        task: {
          select: {
            number: true,
            reward: true,
          }
        }
      }
    });

    if (!userChallengeTask) throw new BadRequestException('Challenge task not found.');

    const {
      updatedReward,
      updatedBalance,
      updatedUserChallengeTask,
    } = await this.prismaService.$transaction(async (transaction) => {
      const [
        updatedReward,
        updatedUserChallengeTask,
        updatedBalance,
      ] = await Promise.all([
        transaction.reward.update({
          where: {
            userId: params.userId,
          },
          data: {
            rewards: {
              increment: userChallengeTask.task.reward,
            },
          }
        }),
        transaction.userChallengeTask.update({
          where: {
            id: userChallengeTask.id,
          },
          data: {
            status: UserChallengeTaskStatus.CLAIMED,
          }
        }),
        this.rewardsLedgerService.addRewardToUserBalance({
          userId: params.userId,
          reward: userChallengeTask.task.reward,
          reason: `Reward claimed for Challenge №${
            userChallengeTask.challenge.number
          } and Task №${
            userChallengeTask.task.number
          }`,
        }, transaction),
      ]);

      return {
        updatedReward,
        updatedUserChallengeTask,
        updatedBalance,
      }
    });

    await Promise.allSettled([
      this.domainEventsPublisher.publish(new RewardUpdatedDomainEvent(updatedReward)),
      this.domainEventsPublisher.publish(new BalanceUpdatedDomainEvent({
        accountId: updatedBalance.accountId!,
        amount: updatedBalance.amount,
        id: updatedBalance.id!,
        createdAt: updatedBalance.createdAt!,
      })),
      this.domainEventsPublisher.publish(new UserChallengeTaskUpdatedDomainEvent(updatedUserChallengeTask)),
    ]);

    return updatedUserChallengeTask;
  }

  public async getUserSeasonState(params: GetUserSeasonStateParams) {
    const season = await this.prismaService.season.findFirst({
      relationLoadStrategy: 'join',
      where: {
        active: true,
      },
      include: {
        challenges: {
          include: {
            tasks: {
              include: {
                usersRelatedTasks: {
                  where: {
                    userId: params.userId,
                  }
                },
              }
            },
          }
        }
      }
    });

    if (!season) throw new BadRequestException(`Season not found.`);

    return season;
  }

  async getUserReward(params: GetUserRewardsParams) {
    const reward = await this.prismaService.reward.findFirst({
      relationLoadStrategy: "join",
      where: {
        userId: params.userId,
      },
      include: {
        balance: {
          select: {
            amount: true,
          }
        }
      }
    });

    if (!reward) throw new BadRequestException('Reward not found.')

    return reward;
  }

  async getTopUsersRewards(params: GetTopUsersRewardsParams) {
    const usersRewards = await this.prismaService.reward.findMany({
      relationLoadStrategy: "join",
      where: {
        OR: [
          {
            currentPlace: {
              lte: LAST_PLACE_ON_TOP_USERS_REWARDS_TABLE,
            },
          },
          {
            userId: params.userId,
          }
        ],
      },
      orderBy: {
        currentPlace: 'asc',
      },
      include: {
        balance: {
          select: {
            amount: true,
          },
        },
      },
    });

    return usersRewards;
  }

  async getCurrentActiveTasks() {
    const tasks = await this.prismaService.challengeTask.findMany({
      where: {
        season: {
          active: true,
        },
      },
    });
    return tasks;
  }

  async getLastPlaceOnLeaderboard() {
    const cachedCountRewards = await this.redisService.get<number>(LAST_PLACE_ON_LEADERBOAD_TTL_CACHE_KEY, false);

    if (cachedCountRewards) return cachedCountRewards;

    const countRewards = await this.prismaService.reward.count();

    await this.redisService.set<number>(
      LAST_PLACE_ON_LEADERBOAD_TTL_CACHE_KEY,
      countRewards,
      {
        expiresInSeconds: LAST_PLACE_ON_LEADERBOAD_TTL_IN_SEC,
      },
    );

    return countRewards;
  }
}
