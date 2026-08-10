import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';
import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { PrivacyPolicies } from '@xyro/core';

import {
  TopSetuperByUsersGraphQLEntity,
  TopSetuperByWinrateGraphQLEntity
} from './topFiveMonthStaticsticGraphQL.models';

@Resolver(() => TopSetuperByWinrateGraphQLEntity)
export class TopSetuperByWinrateGraphQLEntityResolver {
  @ResolveField(() => UserGraphQLOrphanEntity, { nullable: true, name: 'user' })
  user(@Parent() parent: TopSetuperByWinrateGraphQLEntity) {
    return new UserGraphQLOrphanEntity({
      id: parent.userId,
      request: [PrivacyPolicies.showProfile],
    });
  }
}

@Resolver(() => TopSetuperByUsersGraphQLEntity)
export class TopSetuperByUsersGraphQLEntityResolver {
  @ResolveField(() => UserGraphQLOrphanEntity, { nullable: true, name: 'user' })
  user(@Parent() parent: TopSetuperByUsersGraphQLEntity) {
    return new UserGraphQLOrphanEntity({
      id: parent.userId,
      request: [PrivacyPolicies.showProfile],
    });
  }
}
