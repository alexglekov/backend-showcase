import { BadRequestException, ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { RewardsLedgerService } from '@xyro/libs/ledger';
import { AppsNames } from '@xyro/core';
import { UsersService } from '@xyro/contracts/users';
import Decimal from 'decimal.js';
import { Prisma } from '@prisma/client';
import { LoggerService } from '@xyro/libs/logger';
import { DomainEventsPublisher } from '@xyro/libs/events';
import { lastValueFrom } from 'rxjs';
import { RewardUpdatedDomainEvent } from '@xyro/contracts/analytics';
import { BalanceUpdatedDomainEvent } from '@xyro/contracts/ledger';

import { Config } from '../../infrastructure/config';
import { DBTransaction, PrismaService } from '../../infrastructure/prisma';

@Injectable()
export class AirdropRewardsService {
  constructor(
    @Inject(AppsNames.Users) private readonly usersService: UsersService,
    private readonly configService: ConfigService<Config>,
    private readonly prismaService: PrismaService,
    private readonly domainEventsPublisher: DomainEventsPublisher,
    private readonly rewardsLedgerService: RewardsLedgerService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(AirdropRewardsService.name);
  }

  async addTelegramBotRewards(payload: string, receivedSignature: string) {
    const isValid = await this.validateSignature(payload, receivedSignature);

    if (!isValid) {
      throw new ForbiddenException();
    }

    const json = JSON.parse(payload) as { address: string, amount: number };

    const user = await lastValueFrom(
      this.usersService.getUserByAddress({ address: json.address })
    ).catch(() => null);

    if (!user) {
      throw new NotFoundException();
    }

    const {
      balance: updatedBalance,
      reward: updatedReward
    } = await this.prismaService.$transaction(
      async (transaction: DBTransaction) => {
        const balance = await this.rewardsLedgerService.addRewardToUserBalance(
          {
            userId: user.id,
            reward: new Decimal(json.amount),
            reason: `Rewards from Telegram`,
          },
          transaction,
        );

        const reward = await transaction.reward.upsert({
          where: {
            userId: user.id,
          },
          create: {
            balanceId: balance.id!,
            userId: user.id,
            rewards: new Decimal(json.amount)
          },
          update: {
            rewards: {
              increment: new Decimal(json.amount),
            }
          }
        });

        return {
          balance,
          reward,
        }
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    await Promise.allSettled([
      this.domainEventsPublisher.publish(
        new BalanceUpdatedDomainEvent({
          accountId: updatedBalance.accountId,
          amount: updatedBalance.amount,
          id: updatedBalance.id!,
          createdAt: updatedBalance.createdAt,
        })
      ),
      this.domainEventsPublisher.publish(new RewardUpdatedDomainEvent(updatedReward)),
    ])

    this.logger.log({
      action: 'User received telegram bonus',
      payload: {
        userId: user.id,
        walletAddress: json.address,
        bonusAmount: json.amount,
      }
    });
  }

  private async validateSignature(payload: string, receivedSignature: string) {
    const { secretKey } = this.configService.get('airdrops');

    const hmac = createHmac('sha512', secretKey);
    hmac.update(payload);
    
    const signature = hmac.digest('hex');
    
    return receivedSignature === signature;
  }
}
