import { BalanceUpdatedDomainEvent, BalanceUpdatedDomainEventPayload } from '@xyro/contracts/ledger'
import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';

import { PubSubService } from '../../../infrastructure/pub-sub';

@EventsListener()
export class LedgerDomainEventsListener {
  constructor(
    private readonly pubSubService: PubSubService,
  ) {}

  @SubscribeDomainEvent(BalanceUpdatedDomainEvent)
  async onBalanceUpdated(@EventPayload() payload: BalanceUpdatedDomainEventPayload) {

    await this.pubSubService.publishUpdatedBalance(payload.accountId, {
      updatedBalance: payload
    });
  }
}
