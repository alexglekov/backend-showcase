import { Parent, ResolveField, ResolveReference, Resolver } from '@nestjs/graphql';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';
import { PrivacyPolicies } from '@xyro/core';
import { SetupBetGraphQLOrphanEntity, SetupGameGraphQLOrphanEntity } from '@xyro/contracts/setups';

import { SetupBetGraphQLEntity } from '../graphql-models/setupBetGraphQLEntity';
import { SetupGameGraphQLEntity } from '../../games/graphql-models/setupGameGraphQLEntity';
import { DataLoaderService } from '../../dataloaders/dataloaders.service';

@Resolver(() => SetupBetGraphQLEntity)
export class SetupBetGraphQLEntityResolver {
  constructor(
    private readonly dataLoaderService: DataLoaderService,
  ) {}

  @ResolveField(() => SetupGameGraphQLEntity, { name: 'game' })
  resolveGameField(@Parent() parent: SetupBetGraphQLEntity) {
    return this.dataLoaderService.getGameByReference(new SetupGameGraphQLOrphanEntity({ id: parent.gameId }))
  }

  @ResolveField(() => UserGraphQLOrphanEntity, { name: 'owner', nullable: true })
  resolveOwnerField(@Parent() game: SetupBetGraphQLEntity) {
    return new UserGraphQLOrphanEntity({
      id: game.ownerId,
      request: [PrivacyPolicies.showProfile],
    });
  }

  @ResolveReference()
  async resolveReference(
    reference: SetupBetGraphQLOrphanEntity
  ) {
    return this.dataLoaderService.getBetByReference(reference);
  }
}
