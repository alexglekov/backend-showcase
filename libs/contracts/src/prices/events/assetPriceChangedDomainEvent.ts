import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';

import { AssetPriceEntity } from '../entities';

export class AssetPriceChangedDomainEventPayload extends AssetPriceEntity implements BaseEventPayload {
  toJSON() {
    return Object.assign({}, this);
  };
}

export class AssetPriceChangedDomainEvent extends BaseEvent<AssetPriceChangedDomainEventPayload> {
  override eventClass = AssetPriceChangedDomainEvent;

  public static override topic: string = 'asset-price-changed';
  public override payload: AssetPriceChangedDomainEventPayload;

  constructor(assetPrice: AssetPriceEntity) {
    super();

    this.payload = new AssetPriceChangedDomainEventPayload(assetPrice);
  }
}
