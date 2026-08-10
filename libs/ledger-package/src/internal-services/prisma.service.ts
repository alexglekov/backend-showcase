import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PickConstructor, PrismaTransaction } from '@xyro/libs/utils';

export type DBTransaction = PrismaTransaction; 

@Injectable()
export class LedgerPrismaService extends PickConstructor(PrismaClient)('$transaction', 'balance', 'balanceHistory', 'account', 'entry', 'journal') {
  constructor() {
    super();
  }
}