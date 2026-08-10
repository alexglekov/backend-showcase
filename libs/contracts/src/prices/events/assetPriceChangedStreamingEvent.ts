import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';

import { AssetPriceEntity } from '../entities';

export class AssetPriceChangedStreamingEventPayload extends AssetPriceEntity implements BaseEventPayload {
  toJSON() {
    return Object.assign({}, this);
  };
}

export class AssetPriceChangedStreamingEvent extends BaseEvent<AssetPriceChangedStreamingEventPayload> {
  override eventClass = AssetPriceChangedStreamingEvent;

  public static override topic: string = 'asset-price-changed';
  public override payload: AssetPriceChangedStreamingEventPayload;

  constructor(assetPrice: AssetPriceEntity) {
    super();

    this.payload = new AssetPriceChangedStreamingEventPayload(assetPrice);
  }
}
