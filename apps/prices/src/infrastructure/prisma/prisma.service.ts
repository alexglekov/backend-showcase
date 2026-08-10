import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PickConstructor } from '@xyro/libs/utils';

@Injectable()
export class PrismaService extends PickConstructor(PrismaClient)('asset') {
  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });
  }
}
