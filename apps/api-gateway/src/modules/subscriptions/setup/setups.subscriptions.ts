import { Args, Context, Parent, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { SetupBetGraphQLOrphanEntity, SetupGameEntity, SetupGameGraphQLOrphanEntity } from '@xyro/contracts/setups';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';

import { CreatedSetupGamePayload, PubSubService, SetupGameStatePayload } from '../../../infrastructure/pub-sub';
import { GraphQLFederationServerManager } from '../../../infrastructure/graphql';

@Resolver(() => SetupGameGraphQLOrphanEntity)
export class SetupGameSubscriptionsResolver {
  constructor(
    private readonly pubSubService: PubSubService,
    private readonly graphQLFederationServerManager: GraphQLFederationServerManager,
  ) {}

  @Subscription(() => SetupGameGraphQLOrphanEntity)
  setupGameState(@Args('gameId') gameId: string): AsyncIterator<SetupGameStatePayload> {
    return this.pubSubService.setupGameState(gameId);
  }

  @Subscription(() => SetupGameGraphQLOrphanEntity)
  createdSetupGame(): AsyncIterator<CreatedSetupGamePayload> {
    return this.pubSubService.createdSetupGame();
  }

  @ResolveField(() => SetupBetGraphQLOrphanEntity, { name: 'myBet', nullable: true })
  async resolveMyBetField(
    @Parent() parent: SetupGameEntity,
    @UserCredentials(false) credentials?: IUserCredentials,
  ) {
    if (!credentials) return null;

    return this.graphQLFederationServerManager.resolveMySetupBet({ credentials }, parent.id);
  }
}