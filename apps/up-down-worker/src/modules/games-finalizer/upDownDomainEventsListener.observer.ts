import { UpDownGameChangedDomainEvent, UpDownGameChangedDomainEventPayload } from '@xyro/contracts/up-down';
import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';
import { LoggerService } from '@xyro/libs/logger';

import { UpDownGamesFinalizerService } from './upDownGamesResolver.service';

@EventsListener()
export class UpDownDomainEventsListener {
  constructor(
    private readonly logger: LoggerService,
    private readonly service: UpDownGamesFinalizerService,
  ) {
    this.logger.setContext(UpDownDomainEventsListener.name);
  }

  @SubscribeDomainEvent(UpDownGameChangedDomainEvent)
  async onGameChanged(@EventPayload() payload: UpDownGameChangedDomainEventPayload) {
    await this.service.onUpDownGameChanged(payload);
  }
}
