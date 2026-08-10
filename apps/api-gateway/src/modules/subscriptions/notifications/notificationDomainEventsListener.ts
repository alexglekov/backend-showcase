import { NotificationCreatedDomainEvent, NotificationCreatedDomainEventPayload, NotificationEntity } from '@xyro/contracts/notifications'
import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';

import { PubSubService } from '../../../infrastructure/pub-sub';
import { GraphQLFederationServerManager } from '../../../infrastructure/graphql';

@EventsListener()
export class NotificationDomainEventsListener {
  constructor(
    private readonly graphQLFederationServerManager: GraphQLFederationServerManager,
    private readonly pubSubService: PubSubService,
  ) {}

  @SubscribeDomainEvent(NotificationCreatedDomainEvent)
  async onNotificationsCreated(@EventPayload() payload: NotificationCreatedDomainEventPayload): Promise<void> {
    const notification = await this.graphQLFederationServerManager.getNotificationById({}, payload.id);

    await this.pubSubService.publishNotification(payload.userId, {
      notifications: notification
    });
  }
}
