import { Args, Resolver, Subscription } from '@nestjs/graphql';
import { OneVsOneGameGraphQLOrphanEntity } from '@xyro/contracts/one-vs-one';

import { PubSubService, OneVsOneGameStatePayload, CreatedOneVsOneGamePayload } from '../../../infrastructure/pub-sub';

@Resolver()
export class OneVsOneGameSubscriptionsResolver {
  constructor(private readonly pubSubService: PubSubService) {}

  @Subscription(() => OneVsOneGameGraphQLOrphanEntity)
  oneVsOneGameState(@Args('gameId') gameId: string): AsyncIterator<OneVsOneGameStatePayload> {
    return this.pubSubService.oneVsOneGameState(gameId);
  }

  @Subscription(() => OneVsOneGameGraphQLOrphanEntity)
  createdOneVsOneGame(): AsyncIterator<CreatedOneVsOneGamePayload> {
    return this.pubSubService.createdOneVsOneGame();
  }
}
