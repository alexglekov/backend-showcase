import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';
import { AssetPriceChangedDomainEvent, AssetPriceChangedDomainEventPayload } from '@xyro/contracts/prices';

import { PidService } from './pid.service';

@EventsListener()
export class AssetPriceDomainEventsListener {
  constructor(private readonly pidService: PidService) {}

  @SubscribeDomainEvent(AssetPriceChangedDomainEvent)
  async onAssetPriceChanged(@EventPayload() payload: AssetPriceChangedDomainEventPayload): Promise<any> {
    const { assetId, price } = payload;

    // await this.pidService.priceProcessing({assetId, price})
  }
}
