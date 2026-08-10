import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';
import { PrivacyPolicies } from '@xyro/core';

import { OneVsOneGameResultNotificationPayloadGraphQLEntity } from '../models/oneVsOneGameResultPayload.model';

@Resolver(() => OneVsOneGameResultNotificationPayloadGraphQLEntity)
export class OneVsOneGameResultNotificationPayloadGraphQLEntityResolver {
  constructor() {}

  @ResolveField(() => UserGraphQLOrphanEntity, { name: 'opponent', nullable: true })
  opponent(@Parent() payload: OneVsOneGameResultNotificationPayloadGraphQLEntity) {
    if (!payload.opponentId) return null;

    return new UserGraphQLOrphanEntity({
      id: payload.opponentId,
      request: [],
    });
  }
}