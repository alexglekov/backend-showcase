import { Int, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';

import { RewardGraphQLEntity } from './models';
import { RewardsDataLoader } from './dataloaders.service';

@Resolver(() => RewardGraphQLEntity)
export class RewardGraphQLEntityResolver {
  constructor(private readonly rewardsDataLoader: RewardsDataLoader) {}

  @ResolveField(() => UserGraphQLOrphanEntity, { nullable: true, name: 'user' })
  user(@Parent() parent: RewardGraphQLEntity) {
    return new UserGraphQLOrphanEntity({
      id: parent.userId,
      request: [],
    });
  }

  @ResolveField(() => Int, { name: 'lastPlaceOnLeaderboard' })
  async lastPlaceOnLeaderboard(@Parent() parent: RewardGraphQLEntity) {
    return this.rewardsDataLoader.getLastPlaceOnLeaderboard(parent);
  }
}
