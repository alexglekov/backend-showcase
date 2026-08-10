import { EventsListener, EventPayload, SubscribeStreamingEvent } from '@xyro/libs/events';
import {
  BullsEyeGameChangedDomainEvent,
  BullsEyeGameChangedDomainEventPayload,
} from '@xyro/contracts/bulls-eye'
import { LoggerService } from '@xyro/libs/logger';

import { PubSubService } from '../../../infrastructure/pub-sub';
import { GraphQLFederationServerManager } from '../../../infrastructure/graphql';

@EventsListener()
export class BullsEyeDomainEventsListener {
  constructor(
    private readonly logger: LoggerService,
    private readonly graphQLFederationServerManager: GraphQLFederationServerManager,
    private readonly pubSubService: PubSubService,
  ) {
    this.logger.setContext(BullsEyeDomainEventsListener.name);
  }

  @SubscribeStreamingEvent(BullsEyeGameChangedDomainEvent)
  async onBullsEyeGameChanged(@EventPayload() payload: BullsEyeGameChangedDomainEventPayload) {
    this.logger.log({
      action: 'Event BullsEyeGameChanged appeared',
      payload: {
        eventPayload: payload,
      }
    });

    const bullsEyeGame = await this.graphQLFederationServerManager.getBullsEyeGameById({}, payload.id);

    if (!bullsEyeGame) {
      this.logger.log({
        action: 'ApiGateway: BullsEyeDomainEventsListener - null in getting bulls-game',
        event: payload,
      });
      return;
    }

    await this.pubSubService.publishBullsEyeGameState({
      bullsEyeGameState: bullsEyeGame as any
    });
  }
}
