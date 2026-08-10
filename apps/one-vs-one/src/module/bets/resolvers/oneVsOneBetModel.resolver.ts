import {
  Resolver,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { Game1vs1 } from '@prisma/client';
import { PrivacyPolicies } from '@xyro/core';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';

import { OneVsOneBetGraphQLEntity } from '../models/oneVsOneBetModel.type';
import { PrismaService } from '../../../infrastructure/prisma';
import { OneVsOneGameGraphQLEntity } from '../../game/models/oneVsOneGameModel.type';

@Resolver(() => OneVsOneBetGraphQLEntity)
export class OneVsOneBetGraphQLEntityResolver {
  constructor(
    private readonly prismaService: PrismaService,
  ) {}

  @ResolveField(() => OneVsOneGameGraphQLEntity, { name: 'game' })
  async game(@Parent() bet: OneVsOneBetGraphQLEntity) {
    let game: Game1vs1 | null;

    if (bet.fetchedGameFromDb) {
      game = bet.fetchedGameFromDb;
    } else {
      game = await this.prismaService.game1vs1.findFirst({
        where: {
          id: bet.gameId,
        },
      });
    }
    return game ? new OneVsOneGameGraphQLEntity(game) : null;
  }

  @ResolveField(() => UserGraphQLOrphanEntity, { name: 'owner' })
  async owner(
    @Parent() bet: OneVsOneBetGraphQLEntity,
  ) {
    return new UserGraphQLOrphanEntity({
      id: bet.ownerId,
      request: [],
    });
  }
}
