import { Parent, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { BullsEyeBetEntity, BullsEyeBetGraphQLOrphanEntity, BullsEyeGameGraphQLOrphanEntity } from '@xyro/contracts/bulls-eye';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';

import { PubSubService, BullsEyeGameStatePayload } from '../../../infrastructure/pub-sub';

@Resolver(() => BullsEyeGameGraphQLOrphanEntity)
export class BullsEyeGameSubscriptionsResolver {
  constructor(
    private readonly pubSubService: PubSubService,
  ) {}

  @Subscription(() => BullsEyeGameGraphQLOrphanEntity)
  bullsEyeGameState(): AsyncIterator<BullsEyeGameStatePayload> {
    return this.pubSubService.bullsEyeGameState();
  }

  @ResolveField(() => BullsEyeBetGraphQLOrphanEntity, { name: 'myBet', nullable: true })
  resolveMyBetField(
    @Parent() parent: any,
    @UserCredentials(false) credentials?: IUserCredentials,
  ) {
    const { userId } = credentials ?? {};

    if (!userId) return null;

    const bets = (parent?.bets ?? []) as BullsEyeBetEntity[];

    const bet = bets.find((bet) => bet.ownerId === userId);

    return bet || null;
  }
}
