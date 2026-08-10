import { Injectable } from '@nestjs/common';
import { BetResultEnum } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/prisma';

interface GetUserBetsParams {
  take: number;
  skip: number;
  userId: string;
  isActive: boolean;
}

@Injectable()
export class BetsService {
  constructor(
    private readonly prismaService: PrismaService,
  ) {}

  public async getBets(params: GetUserBetsParams) {
    const bets = await this.prismaService.bet.findMany({
      where: {
        ownerId: params.userId,
        result: {
          in: params.isActive ?
            [BetResultEnum.INPROGRESS, BetResultEnum.OPEN]
            : [BetResultEnum.WON, BetResultEnum.LOSS, BetResultEnum.PENDING],
        }
      },
      orderBy: {
        updatedAt: 'desc',
      },
      skip: params.skip,
      take: params.take,
      include: { game: true }
    });

    const total = await this.prismaService.bet.count({
      where: {
        ownerId: params.userId,
        result: {
          in: params.isActive ?
            [BetResultEnum.INPROGRESS, BetResultEnum.OPEN]
            : [BetResultEnum.WON, BetResultEnum.LOSS, BetResultEnum.PENDING]
        }
      },
    })

    return {
      bets,
      total,
      take: params.take,
      skip: params.skip,
    };
  }
}
