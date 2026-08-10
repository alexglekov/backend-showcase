import { GetCountInvitedUsersByUserIdPayload, GetCountInvitedUsersByUserIdResult } from '@xyro/contracts/users';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaErrorTypesEnum, createMD5Hash } from '@xyro/libs/utils';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { RewardsLedgerService } from '@xyro/libs/ledger';
import { Referral } from '@prisma/client';
import { v4 as uuidV4 } from 'uuid';

import { DBTransaction, PrismaService } from '../../infrastructure/prisma';
import Decimal from 'decimal.js';

interface TakeReferralParams {
  userId: string;
  referrerId?: string;
}

interface GetReferralParams {
  userId: string;
}

interface UpdateReferralParams {
  userId: string;
  code: string;
}

interface CheckReferralAvalabilityParams {
  code: string;
}

interface GetUserReferralsStatisticParams {
  userId: string;
}

const AMOUNT_BONUS_FOR_SIGNUP_WITH_REFFERAL = 100;

@Injectable()
export class ReferralsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly rewardsLedgerService: RewardsLedgerService,
  ) {}

  public async takeReferral(
    params: TakeReferralParams,
    dbTransaction: DBTransaction,
  ) {
    const source = dbTransaction ?? this.prismaService;

    const { referrerId, userId } = params;

    const referral = await source.referral.create({
      data: {
        code: this.generateReferralCode(),
        userId,
        referrerId,
      },
    });

    if (referral.referrerId) {
      await this.rewardsLedgerService.addRewardToUserBalance(
        {
          reason: 'Registration by referral code',
          reward: new Decimal(AMOUNT_BONUS_FOR_SIGNUP_WITH_REFFERAL),
          userId,
        },
        dbTransaction,
      );
    }

    return referral;
  }

  async getUserReferral(params: GetReferralParams): Promise<Referral> {
    const { userId } = params;

    const referral = await this.prismaService.referral.findFirst({
      relationLoadStrategy: 'join',
      where: {
        userId,
      },
      include: {
        user: true,
        referrer: true,
      },
    });

    if (!referral) throw new BadRequestException('Referral not found.')

    return referral;
  }

  async updateUserReferral(params: UpdateReferralParams): Promise<Referral> {
    const { userId, code } = params;

    try {
      const referral = await this.prismaService.referral.update({
        relationLoadStrategy: 'join',
        where: {
          userId,
        },
        data: {
          code,
        },
        include: {
          user: true,
          referrer: true,
        },
      });

      return referral;
    } catch (error) {
      if (error.name === PrismaClientKnownRequestError.name) {
        if (error.code === PrismaErrorTypesEnum.UniqueConstraintFailed) throw new BadRequestException('This referral code is already taken.')
        if (error.code === PrismaErrorTypesEnum.RecordToUpdateNotFound) throw new BadRequestException('Referral not found.')
      }

      throw new InternalServerErrorException(error);
    }
  }

  async getUserReferralsStatistic(params: GetUserReferralsStatisticParams) {
    const { userId } = params;

    const [
      numberOfInvited,
      numberOfSecondLevelInvited,
    ] = await Promise.all([
      this.prismaService.referral.count({
        where: {
          referrerId: userId,
        }
      }),
      // TODO: optimize this query
      this.prismaService.referral.count({
        where: {
          referrer: {
            signUpReferral: {
              referrerId: userId,
            }
          }
        }
      }),
    ]);

    return {
      numberOfInvited,
      numberOfSecondLevelInvited,
    };
  }

  async getCountInvitedUsersByUserId(params: GetCountInvitedUsersByUserIdPayload): Promise<GetCountInvitedUsersByUserIdResult> {
    const { userId } = params;

    const countInvitedUsers = await this.prismaService.referral.count({
      where: {
        referrerId: userId,
      }
    });

    return { countInvitedUsers };
  }

  async checkReferralAvalability(params: CheckReferralAvalabilityParams): Promise<Referral> {
    const { code } = params;

    const referral = await this.prismaService.referral.findFirst({
      relationLoadStrategy: 'join',
      where: { code, active: true },
      include: {
        referrer: true,
        user: true,
      }
    });

    if (!referral) throw new BadRequestException('Referral not found.')

    return referral;
  }

  private generateReferralCode() {
    const uuid = uuidV4();
    const [firstLine, secondLine,,, thirdLine] = uuid.split('-');

    return `${
      createMD5Hash(firstLine).slice(0, 3)
    }-${
      createMD5Hash(secondLine).slice(0, 4)
    }-${
      createMD5Hash(thirdLine).slice(0, 4)
    }`.toUpperCase();
  }
}
