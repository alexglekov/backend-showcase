import {
  Resolver,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { GameUpDown } from '@prisma/client';
import { PrivacyPolicies } from '@xyro/core';
import { GraphQLEntitiesNames } from '@xyro/core';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';

import { UpDownBetGraphQLEntity } from '../models/upDownBetGraphQLEntity';
import { UpDownGameGraphQLEntity } from '../../game/models/upDownGameModel.type';
import { PrismaService } from '../../../infrastructure/prisma';

@Resolver(() => UpDownBetGraphQLEntity)
export class UpDownBetGraphQLEntityResolver {
  constructor(
    private readonly prismaService: PrismaService,
  ) {}

  @ResolveField(() => UpDownGameGraphQLEntity, { name: 'game' })
  async game(@Parent() bet: UpDownBetGraphQLEntity) {
    let game: GameUpDown | null;

    if (bet.fetchedGameFromDb) {
      game = bet.fetchedGameFromDb;
    } else {
      game = await this.prismaService.gameUpDown.findFirst({
        where: {
          id: bet.gameId,
        },
      });
    }
    return game ? new UpDownGameGraphQLEntity(game) : null;
  }

  @ResolveField(() => UserGraphQLOrphanEntity, { name: 'owner' })
  owner(@Parent() bet: UpDownBetGraphQLEntity) {
    return new UserGraphQLOrphanEntity({
      id: bet.ownerId,
      request: [PrivacyPolicies.showProfile],
    });
  }
}
