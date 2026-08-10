import {
  AssetPriceChangedDomainEvent, AssetPriceChangedDomainEventPayload,
} from '@xyro/contracts/prices';

import { X1000PricesWorker } from '../workers/x1000Prices.worker';
import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';

@EventsListener()
export class X1000PriceListenerController {
  constructor(private readonly x1000PricesWorker: X1000PricesWorker) {}

  @SubscribeDomainEvent(AssetPriceChangedDomainEvent)
  async onAssetPriceChanged(@EventPayload() payload: AssetPriceChangedDomainEventPayload) {
    const { assetId, price } = payload;

    await this.x1000PricesWorker.onAssetPriceChanged(assetId, Number(price));
  }
}
