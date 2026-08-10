import { OneVsOneGameChangedDomainEvent, OneVsOneGameChangedDomainEventPayload } from '@xyro/contracts/one-vs-one'
import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';
import { GameStateEnum } from '@prisma/client';

import { PubSubService } from '../../../infrastructure/pub-sub';
import { GraphQLFederationServerManager } from '../../../infrastructure/graphql';

@EventsListener()
export class OneVsOneGameStateObserver {
  constructor(
    private readonly pubSubService: PubSubService,
    private readonly graphQLFederationServerManager: GraphQLFederationServerManager,
  ) {}

  @SubscribeDomainEvent(OneVsOneGameChangedDomainEvent)
  async onOneVsOneGameChanged(@EventPayload() payload: OneVsOneGameChangedDomainEventPayload) {
    const game = await this.graphQLFederationServerManager.getOneVsOneGameById({}, payload.id);

    await this.pubSubService.publishOneVsOneGameState(payload.id, {
      oneVsOneGameState: game as any,
    });

    if (payload.state === GameStateEnum.OPEN && !payload.isPrivate) {
      await this.pubSubService.publishNewOneVsOneGame({
        createdOneVsOneGame: game as any,
      });
    }
  }
}
