import {
  Resolver,
  ResolveField,
  Parent,
  ResolveReference,
} from '@nestjs/graphql';
import { BetUpDown } from '@prisma/client';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';
import { UpDownBetGraphQLEntityReference } from '@xyro/contracts/up-down';

import { UpDownBetGraphQLEntity } from '../../bets/models/upDownBetGraphQLEntity';
import { UpDownGameGraphQLEntity } from '../models/upDownGameModel.type';
import { UpDownGamePoolInfoGraphQLEntity } from '../models/upDownGamePoolInfoModel.type';
import { PrismaService } from '../../../infrastructure/prisma';

// TODO: will be removed on https://linear.app/xyro/issue/BE-231
export function getUpDownGamePoolInfo(bets: BetUpDown[], isUp: boolean) {
  const filteredAndSortedBets = bets
    .filter((bet) => bet.isUp === isUp)
    .sort(
      (firstBet, secondBet) =>
        Number(firstBet.amount) - Number(secondBet.amount)
    );

  let poolAmount = 0;

  for (const bet of filteredAndSortedBets) {
    poolAmount += Number(bet.amount);
  }

  return {
    betsCount: filteredAndSortedBets.length,
    poolAmount,
    bets: filteredAndSortedBets,
  };
}


@Resolver(() => UpDownGameGraphQLEntity)
export class UpDownGameGraphQLEntityResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @ResolveField(() => UpDownBetGraphQLEntity, { name: 'myBet', nullable: true })
  async myBet(
    @Parent() game: UpDownGameGraphQLEntity,
    @UserCredentials(false) credentials?: IUserCredentials,
  ) {
    if (credentials) {
      const { userId } = credentials;
      const { fetchedBetsFromDb } = game;

      if (fetchedBetsFromDb) {
        const myBet = fetchedBetsFromDb.find((bet) => bet.ownerId === userId);

        if (myBet) return new UpDownBetGraphQLEntity(myBet);
      }
    }

    return null;
  }

  @ResolveField(() => UpDownGamePoolInfoGraphQLEntity, { name: 'upPool' })
  async upPool(@Parent() game: UpDownGameGraphQLEntity) {
    let bets: BetUpDown[];

    if (game.fetchedBetsFromDb) {
      bets = game.fetchedBetsFromDb;
    } else {
      bets = await this.prismaService.betUpDown.findMany({
        where: {
          gameId: game.id,
        },
      });
    }

    const poolInfo = getUpDownGamePoolInfo(bets, true);

    return {
      ...poolInfo,
      bets: poolInfo.bets.map((bet) => new UpDownBetGraphQLEntity(bet))
    };
  }

  @ResolveField(() => UpDownGamePoolInfoGraphQLEntity, { name: 'downPool' })
  async downPool(@Parent() game: UpDownGameGraphQLEntity) {
    let bets: BetUpDown[];

    if (game.fetchedBetsFromDb) {
      bets = game.fetchedBetsFromDb;
    } else {
      bets = await this.prismaService.betUpDown.findMany({
        where: {
          gameId: game.id,
        },
      });
    }

    const poolInfo = getUpDownGamePoolInfo(bets, false);

    return {
      ...poolInfo,
      bets: poolInfo.bets.map((bet) => new UpDownBetGraphQLEntity(bet))
    };
  }


  @ResolveField(() => [UpDownBetGraphQLEntity], { name: 'bets' })
  async bets(@Parent() game: UpDownGameGraphQLEntity) {
    let bets: BetUpDown[];

    if (game.fetchedBetsFromDb) {
      bets = game.fetchedBetsFromDb;
    } else {
      bets = await this.prismaService.betUpDown.findMany({
        where: {
          gameId: game.id,
        },
      });
    }
    return bets.map((bet) => new UpDownBetGraphQLEntity(bet));
  }

  @ResolveReference()
  async resolveReference(reference: UpDownBetGraphQLEntityReference) {
    const bet = await this.prismaService.betUpDown.findFirst({
      where: {
        id: reference.id,
      }
    });

    return bet ? new UpDownBetGraphQLEntity(bet) : null;
  }
}
