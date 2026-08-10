import { Parent, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { UpDownBetEntity, UpDownBetGraphQLOrphanEntity, UpDownGameGraphQLOrphanEntity } from '@xyro/contracts/up-down';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';

import { PubSubService, UpDownGameStatePayload } from '../../../infrastructure/pub-sub';

@Resolver(() => UpDownGameGraphQLOrphanEntity)
export class UpDownGameSubscriptionsResolver {
  constructor(
    private readonly pubSubService: PubSubService,
  ) {}

  @Subscription(() => UpDownGameGraphQLOrphanEntity)
  upDownGameState(): AsyncIterator<UpDownGameStatePayload> {
    return this.pubSubService.upDownGameState();
  }

  @ResolveField(() => UpDownBetGraphQLOrphanEntity, { name: 'myBet', nullable: true })
  resolveMyBetField(
    @Parent() parent: any,
    @UserCredentials(false) credentials?: IUserCredentials,
  ) {
    const { userId } = credentials ?? {};

    if (!userId) return null;

    const downBets = (parent?.downPool?.bets ?? []) as UpDownBetEntity[];

    let bet = downBets.find((bet) => bet.ownerId === userId);

    if (bet) return bet;

    const upBets = (parent?.upPool?.bets ?? []) as UpDownBetEntity[];

    bet = upBets.find((bet) => bet.ownerId === userId);

    return bet || null;
  }
}
