import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';
import {
  UpDownGameChangedDomainEvent,
  UpDownGameChangedDomainEventPayload
} from '@xyro/contracts/up-down';

import { UpDownGameService } from './upDownGame.service';

@EventsListener()
export class UpDownDomainEventsListener {
  constructor(
    private readonly upDownGameService: UpDownGameService,
  ) {}

  @SubscribeDomainEvent(UpDownGameChangedDomainEvent)
  async onUpDownGameChanged(@EventPayload() payload: UpDownGameChangedDomainEventPayload) {
    await this.upDownGameService.onGameChanged(payload);
  }
}
