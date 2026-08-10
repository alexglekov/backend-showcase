import {
  CandleCreatedDomainEvent,
  CandleCreatedDomainEventPayload
} from '@xyro/contracts/candles';
import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';

import { CandleService } from './candle.service';

@EventsListener()
export class CandleListenerController {
  constructor(private readonly candleService: CandleService) {}

  @SubscribeDomainEvent(CandleCreatedDomainEvent)
  async handle(@EventPayload() payload: CandleCreatedDomainEventPayload) {
    this.candleService.onCandleCreated(payload);
  }
}
