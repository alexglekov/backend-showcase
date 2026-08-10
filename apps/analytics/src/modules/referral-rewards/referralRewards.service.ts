import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { BalanceUpdatedDomainEvent } from '@xyro/contracts/ledger';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { DomainEventsPublisher } from '@xyro/libs/events';
import { RewardsLedgerService } from '@xyro/libs/ledger';
import { PrismaErrorTypesEnum } from '@xyro/libs/utils';
import { UsersService } from '@xyro/contracts/users';
import { LoggerService } from '@xyro/libs/logger';
import { Prisma, Referral } from '@prisma/client';
import { lastValueFrom } from 'rxjs';
import Decimal from 'decimal.js';

import { AMOUNT_FOR_REFERRAL } from './constants';
import { DBTransaction, PrismaService } from '../../infrastructure/prisma';
import { AppsNames } from '@xyro/core';

@Injectable()
export class ReferralRewardsService {
  constructor(
    @Inject(AppsNames.Users) private readonly usersService: UsersService,
    private readonly prismaService: PrismaService,
    private readonly domainEventsPublisher: DomainEventsPublisher,
    private readonly rewardsLedgerService: RewardsLedgerService,
    private readonly logger: LoggerService,
  ) {}

  public async syncRewardsForReferrals(userId: string) {
    const foundUser = await lastValueFrom(
      this.usersService.getUserByAddress({ address: '0xa1E10d8822CCA44f6FD4Ee60Aa586eFee6AeD6c0' })
    ).catch(() => null);

    if (!foundUser || foundUser.id !== userId) {
      throw new ForbiddenException();
    }

    const take = 50;
    let skip = 0;
    let referrals = [];

    do {
      referrals = await this.prismaService.referral.findMany({
        where: {
          isReferrerRewardReceived: false,
          referrerId: {
            not: null,
          },
        },
        take,
        skip
      });

      skip += referrals.length;

      for (const referral of referrals) {
        await this.addBonusForReferral(referral);

        this.logger.log({
          action: 'User received bonus for referral',
          payload: {
            userId: referral.userId,
            referrerId: referral.referrerId,
          }
        });
      }
    } while(referrals.length !== 0);
  }

  public async addBonusForReferral(referral: Pick<Referral, 'referrerId' | 'isReferrerRewardReceived' | 'userId'>) {
    const { referrerId, isReferrerRewardReceived, userId } = referral;

    if (!referrerId) return;
    if (isReferrerRewardReceived) return;

    try {
      const balance = await this.prismaService.$transaction(
        async (transaction: DBTransaction) => {
          await transaction.referral.update({
            where: {
              userId,
              isReferrerRewardReceived: false,
            },
            data: {
              isReferrerRewardReceived: true,
            }
          });

          await transaction.reward.update({
            where: {
              userId: referrerId,
            },
            data: {
              referralRewards: {
                increment: new Decimal(AMOUNT_FOR_REFERRAL),
              },
              rewards: {
                increment: new Decimal(AMOUNT_FOR_REFERRAL),
              },
            }
          });

          const updatedBalance = await this.rewardsLedgerService.addRewardToUserBalance(
            {
              reason: 'Referral bonus',
              reward: new Decimal(AMOUNT_FOR_REFERRAL),
              userId: referrerId,
            },
            transaction
          );

          return updatedBalance;
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        }
      );

      await Promise.allSettled([
        this.domainEventsPublisher.publish(
          new BalanceUpdatedDomainEvent({
            accountId: balance.accountId,
            amount: balance.amount,
            id: balance.id!,
            createdAt: balance.createdAt,
          })
        ),
      ]);  
    } catch (error) {
      if (error.name === PrismaClientKnownRequestError.name) {
        if (error.code === PrismaErrorTypesEnum.RecordToUpdateNotFound) return;
      }

      this.logger.log({
        action: 'Error occured on gave bonus for referral',
        payload: {
          errorMessage: error.message,
          errorStack: error.stack,
          userId,
          referrerId,
        },
      });

      throw error;
    }
  }
}
