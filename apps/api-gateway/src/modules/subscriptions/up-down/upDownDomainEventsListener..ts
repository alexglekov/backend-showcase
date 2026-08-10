import { EventsListener, EventPayload, SubscribeStreamingEvent } from '@xyro/libs/events';
import {
  UpDownGameChangedDomainEvent,
  UpDownGameChangedDomainEventPayload,
} from '@xyro/contracts/up-down'
import { LoggerService } from '@xyro/libs/logger';

import { PubSubService } from '../../../infrastructure/pub-sub';
import { GraphQLFederationServerManager } from '../../../infrastructure/graphql';

@EventsListener()
export class UpDownDomainEventsListener {
  constructor(
    private readonly logger: LoggerService,
    private readonly graphQLFederationServerManager: GraphQLFederationServerManager,
    private readonly pubSubService: PubSubService,
  ) {
    this.logger.setContext(UpDownDomainEventsListener.name);
  }

  @SubscribeStreamingEvent(UpDownGameChangedDomainEvent)
  async onUpDownGameChanged(@EventPayload() payload: UpDownGameChangedDomainEventPayload) {
    this.logger.log({
      action: 'Event UpDownGameChanged appeared',
      payload: {
        eventPayload: payload,
      }
    });

    const upDownGame = await this.graphQLFederationServerManager.getUpDownGameById({}, payload.id);

    if (!upDownGame) {
      this.logger.log({
        action: 'ApiGateway: UpDownDomainEventsListener - null in getting up/down game',
        event: payload,
      });
      return;
    }

    await this.pubSubService.publishUpDownGameState({
      upDownGameState: upDownGame as any
    });
  }
}
