import { EventPayload, EventsListener, SubscribeStreamingEvent } from '@xyro/libs/events';
import { AssetPriceChangedDomainEvent, AssetPriceChangedDomainEventPayload } from '@xyro/contracts/prices'

import { PubSubService } from '../../../infrastructure/pub-sub';

@EventsListener()
export class AssetPriceChangedObserver {
  constructor(
    private readonly pubSubService: PubSubService,
  ) {}

  @SubscribeStreamingEvent(AssetPriceChangedDomainEvent)
  async onAssetPriceChanged(@EventPayload() payload: AssetPriceChangedDomainEventPayload) {
    this.pubSubService
      .publishAssetPriceChanged(payload.assetId, { assetPriceChanged: payload })
      .catch((error) => null);
  }
}
