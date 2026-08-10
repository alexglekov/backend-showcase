import { AssetPriceChangedDomainEvent, AssetPriceChangedDomainEventPayload } from '@xyro/contracts/prices';
import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';
import { SetupGameChangedDomainEvent, SetupGameChangedDomainEventPayload } from '@xyro/contracts/setups';

import { SetupGameWorker } from './setupGame.worker';

@EventsListener()
export class SetupWorkerObserver {
  constructor(
    private readonly setupGameWorker: SetupGameWorker
  ) {}

  @SubscribeDomainEvent(SetupGameChangedDomainEvent)
  async onGameChanged(@EventPayload() payload: SetupGameChangedDomainEventPayload) {
    await this.setupGameWorker.onGameChanged(payload);
  }

  @SubscribeDomainEvent(AssetPriceChangedDomainEvent)
  async handle(@EventPayload() payload: AssetPriceChangedDomainEventPayload) {
    await this.setupGameWorker.onAssetPriceChanged(payload);
  }
}
