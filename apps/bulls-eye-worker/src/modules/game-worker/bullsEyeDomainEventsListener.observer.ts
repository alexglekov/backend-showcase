import { BullsEyeGameChangedDomainEvent, BullsEyeGameChangedDomainEventPayload } from '@xyro/contracts/bulls-eye';
import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';
import { LoggerService } from '@xyro/libs/logger';

import { BullsEyeGameWorker } from './bullsEyeGame.worker';

@EventsListener()
export class BullsEyeDomainEventsListener {
  constructor(
    private readonly logger: LoggerService,
    private readonly worker: BullsEyeGameWorker,
  ) {
    this.logger.setContext(BullsEyeDomainEventsListener.name);
  }

  @SubscribeDomainEvent(BullsEyeGameChangedDomainEvent)
  async onGameChanged(@EventPayload() payload: BullsEyeGameChangedDomainEventPayload) {
    await this.worker.onBullsEyeGameChanged(payload);
  }
}
