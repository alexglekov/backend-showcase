import { NotifyTaskCreatedDomainEventPayload, NotifyTaskCreatedDomainEvent } from '@xyro/contracts/notifications';
import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';

import { InboundNotificationsService } from './inboundNotifications.service';

@EventsListener()
export class InboundNotificationsController {
  constructor(
    private readonly service: InboundNotificationsService,
  ) {}

  @SubscribeDomainEvent(NotifyTaskCreatedDomainEvent)
  async handleEvent(@EventPayload() payload: NotifyTaskCreatedDomainEventPayload) {
    await this.service.handleEvent(payload);
  }
}
