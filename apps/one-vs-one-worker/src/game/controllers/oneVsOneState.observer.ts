import {
  OneVsOneGameChangedDomainEvent,
  OneVsOneGameChangedDomainEventPayload,
} from '@xyro/contracts/one-vs-one';
import { LoggerService } from '@xyro/libs/logger';

import { OneVsOneGameWorker } from '../workers/oneVsOneGame.worker';
import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';

@EventsListener()
export class OneVsOneGameStateObserver {
  constructor(
    private readonly oneVsOneGameWorker: OneVsOneGameWorker,
    protected readonly logger: LoggerService
  ) {
    this.logger.setContext(OneVsOneGameStateObserver.name);
  }

  @SubscribeDomainEvent(OneVsOneGameChangedDomainEvent)
  async onOneVsOneGameChanged(@EventPayload() payload: OneVsOneGameChangedDomainEventPayload) {
    try {
      await this.oneVsOneGameWorker.onOneVsOneGameChanged(payload);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
