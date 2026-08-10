import {
  Resolver,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { GameBullseye } from '@prisma/client';
import { PrivacyPolicies } from '@xyro/core';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';

import { BullsEyeBetGraphQLEntity } from '../models/bullsEyeBetGraphQLEntity';
import { BullsEyeGameGraphQLEntity } from '../../game/models/bullsEyeGameModel.type';
import { PrismaService } from '../../../infrastructure/prisma';

@Resolver(() => BullsEyeBetGraphQLEntity)
export class BullsEyeBetGraphQLEntityResolver {
  constructor(
    private readonly prismaService: PrismaService,
  ) {}

  @ResolveField(() => BullsEyeGameGraphQLEntity, { name: 'game' })
  async game(@Parent() bet: BullsEyeBetGraphQLEntity) {
    let game: GameBullseye | null;

    if (bet.fetchedGameFromDb) {
      game = bet.fetchedGameFromDb;
    } else {
      game = await this.prismaService.gameBullseye.findFirst({
        where: {
          id: bet.gameId,
        },
      });
    }
    return game ? new BullsEyeGameGraphQLEntity(game) : null;
  }

  @ResolveField(() => UserGraphQLOrphanEntity, { name: 'owner' })
  owner(@Parent() bet: BullsEyeBetGraphQLEntity) {
    return new UserGraphQLOrphanEntity({
      id: bet.ownerId,
      request: [PrivacyPolicies.showProfile],
    });
  }
}
