import {
  Resolver,
  ResolveField,
  Parent,
  ResolveReference,
} from '@nestjs/graphql';
import { BetBullseye, GameStateEnum } from '@prisma/client';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';
import { BullsEyeBetGraphQLEntityReference } from '@xyro/contracts/bulls-eye';

import { BullsEyeBetGraphQLEntity } from '../../bets/models/bullsEyeBetGraphQLEntity';
import { BullsEyeGameGraphQLEntity } from '../models/bullsEyeGameModel.type';
import { BullsEyeGamePoolInfoGraphQLEntity } from '../models/bullsEyeGamePoolInfoModel.type';
import { PrismaService } from '../../../infrastructure/prisma';

// TODO: will be removed on https://linear.app/xyro/issue/BE-231
export function getBullsEyeGamePoolInfo(bets: BetBullseye[]) {
  let poolAmount = 0;

  for (const bet of bets) {
    poolAmount += Number(bet.amount);
  }

  return {
    betsCount: bets.length,
    poolAmount,
  };
}

@Resolver(() => BullsEyeGameGraphQLEntity)
export class BullsEyeGameGraphQLEntityResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @ResolveField(() => BullsEyeBetGraphQLEntity, { name: 'myBet', nullable: true })
  async myBet(
    @Parent() game: BullsEyeGameGraphQLEntity,
    @UserCredentials(false) credentials?: IUserCredentials,
  ) {
    if (!credentials) return null;

    const { userId } = credentials;
    const { fetchedBetsFromDb } = game;

    if (!fetchedBetsFromDb) return null;

    const myBet = fetchedBetsFromDb.find((bet) => bet.ownerId === userId);

    if (!myBet) return null; 

    return new BullsEyeBetGraphQLEntity(myBet);
  }

  @ResolveField(() => BullsEyeGamePoolInfoGraphQLEntity, {
    name: 'pool',
    nullable: true,
  })
  async pool(
    @Parent() game: BullsEyeGameGraphQLEntity,
  ): Promise<BullsEyeGamePoolInfoGraphQLEntity> {
    let bets = game.fetchedBetsFromDb;

    if (!bets) {
      bets = await this.prismaService.betBullseye.findMany({
        where: {
          gameId: game.id,
        },
      });
    }

    const poolInfo = getBullsEyeGamePoolInfo(bets);

    return poolInfo;
  }

  @ResolveField(() => BullsEyeBetGraphQLEntity, {
    name: 'winnerBet',
    nullable: true,
  })
  async winnerBet(@Parent() game: BullsEyeGameGraphQLEntity) {
    if (game.winnerBetId) {
      let bet: BetBullseye | undefined;

      if (game.fetchedBetsFromDb) {
        bet = game.fetchedBetsFromDb.find((bet) => bet.id === game.winnerBetId);
      }

      if (!bet) {
        bet = await this.prismaService.betBullseye.findFirst({
          where: {
            gameId: game.id,
            id: game.winnerBetId,
          },
        }) as any;
      }

      return bet ? new BullsEyeBetGraphQLEntity(bet) : null;
    }

    return null;
  }

  @ResolveField(() => [BullsEyeBetGraphQLEntity], { name: 'bets' })
  async bets(@Parent() game: BullsEyeGameGraphQLEntity) {
    let bets: BetBullseye[];

    if (game.fetchedBetsFromDb) {
      bets = game.fetchedBetsFromDb;
    } else {
      bets = await this.prismaService.betBullseye.findMany({
        where: {
          gameId: game.id,
        },
      });
    }

    if (game.state === GameStateEnum.CLOSE) {
      bets = bets.sort((firstBet, secondBet) => secondBet.place! - firstBet.place!);
    }

    return bets.map((bet) => new BullsEyeBetGraphQLEntity(bet));
  }

  @ResolveReference()
  async resolveReference(reference: BullsEyeBetGraphQLEntityReference) {
    const bet = await this.prismaService.betBullseye.findFirst({
      where: {
        id: reference.id,
      }
    });

    return bet ? new BullsEyeBetGraphQLEntity(bet) : null;
  }
}
