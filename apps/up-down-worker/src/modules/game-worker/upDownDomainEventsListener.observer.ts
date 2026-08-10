import { UpDownGameChangedDomainEvent, UpDownGameChangedDomainEventPayload } from '@xyro/contracts/up-down';
import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';
import { LoggerService } from '@xyro/libs/logger';

import { UpDownGameWorker } from './upDownGame.worker';

@EventsListener()
export class UpDownDomainEventsListener {
  constructor(
    private readonly logger: LoggerService,
    private readonly worker: UpDownGameWorker,
  ) {
    this.logger.setContext(UpDownDomainEventsListener.name);
  }

  @SubscribeDomainEvent(UpDownGameChangedDomainEvent)
  async onGameChanged(@EventPayload() payload: UpDownGameChangedDomainEventPayload) {
    await this.worker.onUpDownGameChanged(payload);
  }
}
