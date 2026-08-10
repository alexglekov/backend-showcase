import {
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Bet1vs1 } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { PrivacyPolicies } from '@xyro/core';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';

import { PrismaService } from '../../../infrastructure/prisma';
import { OneVsOneGameGraphQLEntity } from '../models/oneVsOneGameModel.type';
import { OneVsOneBetGraphQLEntity } from '../../bets/models/oneVsOneBetModel.type';

@Resolver(() => OneVsOneGameGraphQLEntity)
export class OneVsOneGameGraphQLEntityResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @ResolveField(() => UserGraphQLOrphanEntity, { name: 'owner' })
  owner(@Parent() game: OneVsOneGameGraphQLEntity) {
    return new UserGraphQLOrphanEntity({
      id: game.ownerId,
      request: [],
    });
  }

  @ResolveField(() => UserGraphQLOrphanEntity, { name: 'opponent' })
  opponent(@Parent() game: OneVsOneGameGraphQLEntity) {
    if (!game.opponentId) return null;

    return new UserGraphQLOrphanEntity({
      id: game.opponentId,
      request: [PrivacyPolicies.showProfile],
    });
  }

  @ResolveField(() => OneVsOneBetGraphQLEntity, { name: 'ownerBet' })
  async ownerBet(@Parent() game: OneVsOneGameGraphQLEntity) {
    let bet: Bet1vs1 | undefined | null;

    if (game.fetchedBetsFromDb) {
      bet = game.fetchedBetsFromDb.find((bet) => bet.ownerId === game.ownerId);
    } else {
      bet = await this.prismaService.bet1vs1.findFirst({
        where: {
          gameId: game.id,
          ownerId: game.ownerId,
        },
      });
    }

    if (!bet) {
      throw new GraphQLError('UnexpectedError: owner bet not found');
    }

    return new OneVsOneBetGraphQLEntity(bet);
  }

  @ResolveField(() => OneVsOneBetGraphQLEntity, {
    name: 'opponentBet',
    nullable: true,
  })
  async opponentBet(@Parent() game: OneVsOneGameGraphQLEntity) {
    if (game.opponentId) {
      let bet: Bet1vs1 | undefined | null;

      if (game.fetchedBetsFromDb) {
        bet = game.fetchedBetsFromDb.find(
          (bet) => bet.ownerId === game.opponentId,
        );
      } else {
        bet = await this.prismaService.bet1vs1.findFirst({
          where: {
            gameId: game.id,
            ownerId: game.opponentId,
          },
        });
      }

      return bet ? new OneVsOneBetGraphQLEntity(bet) : null;
    }

    return null;
  }

  @ResolveField(() => [OneVsOneBetGraphQLEntity], { name: 'bets' })
  async bets(@Parent() game: OneVsOneGameGraphQLEntity) {
    let bets: Bet1vs1[];

    if (game.fetchedBetsFromDb) {
      bets = game.fetchedBetsFromDb;
    } else {
      bets = await this.prismaService.bet1vs1.findMany({
        where: {
          gameId: game.id,
        },
      });
    }
    return bets.map((bet) => new OneVsOneBetGraphQLEntity(bet));
  }

}
