import { BadRequestException, Injectable } from '@nestjs/common';
import { GameStateEnum } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/prisma';
import { SetupBetGraphQLOrphanEntity } from '@xyro/contracts/setups';

type TGetBetsByParams = {
  ownerId?: string;
  gameOwnerId?: string;
  gameId?: string;
  isActive?: boolean;
  skip: number;
  take: number;
}

@Injectable()
export class SetupBetsReadService {
  constructor(private readonly prismaService: PrismaService) {}

  public async resolveReferences(references: SetupBetGraphQLOrphanEntity[]) {
    const bets = await this.prismaService.betSetup.findMany({
      where: {
        OR: references.map((reference) => ({
          gameId: reference.gameId,
          ownerId: reference.ownerId,
        })),
      }
    });

    return bets;
  }

  public async getBetByGameIdAndOnwerId(gameId: string, ownerId: string) {
    const bet = await this.prismaService.betSetup.findFirst({
      where: {
        gameId,
        ownerId
      }
    });

    if (!bet) {
      throw new BadRequestException(`User Setup Game not found.`);
    }

    return bet;
  }

  public async getBetsBy(params: TGetBetsByParams) {
    const bets = await this.prismaService.betSetup.findMany({
      where: {
        game: typeof params.isActive === 'boolean' || params.gameOwnerId ? {
          ownerId: params.gameOwnerId || undefined,
          state: typeof params.isActive === 'boolean' ? {
            in: params.isActive
              ? [GameStateEnum.OPEN, GameStateEnum.INPROGRESS]
              : [GameStateEnum.PENDING, GameStateEnum.CLOSE],
          } : undefined,
        } : undefined,
        ownerId: params.ownerId || undefined,
        gameId: params.gameId || undefined,
      },
      orderBy: {
        game: {
          createdAt: 'desc',
        },
      },
      skip: params.skip,
      take: params.take,
    });

    return {
      bets,
      take: params.take,
      skip: params.skip,
    };
  }
}
