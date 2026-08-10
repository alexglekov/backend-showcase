import { Parent, ResolveField, ResolveReference, Resolver } from '@nestjs/graphql';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';
import { PrivacyPolicies } from '@xyro/core';
import { SetupBetGraphQLOrphanEntity, SetupGameGraphQLOrphanEntity } from '@xyro/contracts/setups';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';

import {
  SetupGameGraphQLEntity,
} from '../graphql-models/setupGameGraphQLEntity';
import { SetupBetGraphQLEntity } from '../../bets/graphql-models/setupBetGraphQLEntity';
import { DataLoaderService } from '../../dataloaders/dataloaders.service';

@Resolver(() => SetupGameGraphQLEntity)
export class SetupGameGraphQLEntityResolver {
  constructor(
    private readonly dataLoaderService: DataLoaderService,
  ) {}

  @ResolveField(() => SetupBetGraphQLEntity, { name: 'myBet', nullable: true })
  async myBet(
    @Parent() game: SetupGameGraphQLEntity,
    @UserCredentials(false) credentials?: IUserCredentials,
  ): Promise<SetupBetGraphQLEntity | null> {
    if (!credentials) return null;

    const { userId } = credentials;

    return this.dataLoaderService.getBetByReference(
      new SetupBetGraphQLOrphanEntity({ gameId: game.id, ownerId: userId }),
    )
  }

  @ResolveField(() => UserGraphQLOrphanEntity, { name: 'owner', nullable: true })
  owner(@Parent() game: SetupGameGraphQLEntity) {
    return new UserGraphQLOrphanEntity({
      id: game.ownerId,
      request: [PrivacyPolicies.showProfile],
    });
  }

  @ResolveReference()
  async resolveReference(reference: SetupGameGraphQLOrphanEntity) {
    return this.dataLoaderService.getGameByReference(reference);
  }
}
