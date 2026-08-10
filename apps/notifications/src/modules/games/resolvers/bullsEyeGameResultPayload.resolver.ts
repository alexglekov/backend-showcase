import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';

import { BullsEyeGameResultNotificationPayloadGraphQLEntity } from '../models/bullsEyeGameResultPayload.model';

@Resolver(() => BullsEyeGameResultNotificationPayloadGraphQLEntity)
export class BullsEyeGameResultNotificationPayloadGraphQLEntityResolver {
  constructor() {}

  @ResolveField(() => UserGraphQLOrphanEntity, { name: 'winner', nullable: true })
  winner(
    @Parent() payload: BullsEyeGameResultNotificationPayloadGraphQLEntity,
  ) {
    if (!payload.winnerId) return null;

    return new UserGraphQLOrphanEntity({
      id: payload.winnerId,
      request: [],
    });
  }
}