import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PickConstructor, PrismaTransaction } from '@xyro/libs/utils'

export type DBTransaction = PrismaTransaction;

@Injectable()
export class PrismaService
  extends PickConstructor(PrismaClient)(
    '$transaction',
    'notifications',
    'game1vs1',
    'gameBullseye',
    'gameSetup',
    'gameUpDown',
    'gameX1000',
    'bet1vs1',
    'betBullseye',
    'betSetup',
    'betUpDown',
    'betX1000'
  ) {
  constructor() {
    super();
  }
}