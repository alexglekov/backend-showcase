import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PickConstructor, PrismaTransaction } from '@xyro/libs/utils'

export type DBTransaction = PrismaTransaction;

@Injectable()
export class PrismaService extends PickConstructor(PrismaClient)('bet1vs1', 'game1vs1', '$transaction') {
  constructor() {
    super();
  }
}