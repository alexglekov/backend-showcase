import { SetupBetChangedDomainEvent, SetupBetChangedDomainEventPayload, SetupGameChangedDomainEvent, SetupGameChangedDomainEventPayload } from '@xyro/contracts/setups'
import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';
import { BetResultEnum, GameStateEnum } from '@prisma/client';

import { PubSubService } from '../../../infrastructure/pub-sub';
import { GraphQLFederationServerManager } from '../../../infrastructure/graphql';

@EventsListener()
export class SetupGameStateObserver {
  constructor(
    private readonly pubSubService: PubSubService,
    private readonly graphQLFederationServerManager: GraphQLFederationServerManager,
  ) {}

  @SubscribeDomainEvent(SetupGameChangedDomainEvent)
  async onSetupGameChanged(@EventPayload() payload: SetupGameChangedDomainEventPayload) {
    const game = await this.graphQLFederationServerManager.getSetupGameById({}, payload.id);

    await this.pubSubService.publishSetupGameState(payload.id, {
      setupGameState: game as any,
    });

    if (payload.state === GameStateEnum.OPEN) {
      await this.pubSubService.publishNewSetupGame({
        createdSetupGame: game as any,
      });
    }
  }

  @SubscribeDomainEvent(SetupBetChangedDomainEvent)
  async onSetupBetChanged(@EventPayload() payload: SetupBetChangedDomainEventPayload) {
    if (payload.result !== BetResultEnum.OPEN) return;

    const game = await this.graphQLFederationServerManager.getSetupGameById({}, payload.gameId);

    await this.pubSubService.publishSetupGameState(payload.gameId, {
      setupGameState: game as any,
    });
  }
}
