import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PickConstructor, PrismaTransaction } from '@xyro/libs/utils'

export type DBTransaction = PrismaTransaction

@Injectable()
export class PrismaService extends PickConstructor(PrismaClient)(
  'user',
  'privacyPolicy',
  'emailNotificationPolicy',
  'session',
  'paymentOrder',
  'paymentTransaction',
  '$transaction',
  'referral',
  'userDailyLogin',
) {
  constructor() {
    super();
  }
}
