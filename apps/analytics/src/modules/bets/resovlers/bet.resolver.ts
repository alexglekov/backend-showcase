import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { PrivacyPolicies } from '@xyro/core';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';

import { PrismaService } from '../../../infrastructure/prisma';
import { BetGraphQLEntity } from '../graphql-models';
import { GameGraphQLEntity } from '../../game';


@Resolver(() => BetGraphQLEntity)
export class BetResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @ResolveField(() => GameGraphQLEntity)
  async game(@Parent() parent: BetGraphQLEntity) {
    const { fetchedGameFromDb } = parent;

    if (fetchedGameFromDb) return new GameGraphQLEntity(fetchedGameFromDb);

    // TODO n+1 problem BE-82
    const foundGame = await this.prismaService.game.findFirstOrThrow({
      where: {
        id: parent.gameId,
      }
    });

    return new GameGraphQLEntity(foundGame);
  }

  @ResolveField(() => UserGraphQLOrphanEntity, { nullable: true, name: 'owner' })
  owner(@Parent() parent: BetGraphQLEntity) {
    return new UserGraphQLOrphanEntity({
      id: parent.ownerId,
      request: [PrivacyPolicies.showProfile],
    });
  }
}
