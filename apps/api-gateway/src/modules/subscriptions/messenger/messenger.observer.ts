import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';
import { MessageCreatedDomainEvent, MessageCreatedDomainEventPayload } from '@xyro/contracts/messenger'

import { PubSubService } from '../../../infrastructure/pub-sub';
import { GraphQLFederationServerManager } from '../../../infrastructure/graphql';

@EventsListener()
export class MessengerDomainEventsListener {
  constructor(
    private readonly graphQLFederationServerManager: GraphQLFederationServerManager,
    private readonly pubSubService: PubSubService,
  ) {}

  @SubscribeDomainEvent(MessageCreatedDomainEvent)
  async onMessageCreated(@EventPayload() payload: MessageCreatedDomainEventPayload) {
    // TODO: cache requests
    const message = await this.graphQLFederationServerManager.getMessageById({}, payload.id)

    await this.pubSubService.publishNewMessageToRoom(payload.roomId, {
      roomMessages: message as unknown as MessageCreatedDomainEventPayload,
    });
  }
}
