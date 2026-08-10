import { Resolver, Subscription } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';
import { X1000GameGraphQLOrphanEntity } from '@xyro/contracts/x1000';

import { PubSubService, X1000GameStatePayload, PublicX1000GamesPayload } from '../../../infrastructure/pub-sub';

@Resolver()
export class X1000GameSubscriptionsResolver {
  constructor(private readonly pubSubService: PubSubService) {}

  @Subscription(() => X1000GameGraphQLOrphanEntity)
  x1000GameState(
    @UserCredentials() credentials: IUserCredentials,
  ): AsyncIterator<X1000GameStatePayload> {
    const { userId } = credentials;

    return this.pubSubService.x1000GameState(userId);
  }

  @Subscription(() => X1000GameGraphQLOrphanEntity)
  publicX1000Games(): AsyncIterator<PublicX1000GamesPayload> {
    return this.pubSubService.publicX1000Games();
  }
}