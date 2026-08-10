import { CandleRaw } from '@xyro/libs/columnDb';
import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';
import { ValidateNested } from 'class-validator';

import { CandleEntity } from '../entities';

export class CandleCreatedDomainEventPayload implements BaseEventPayload {
  @ValidateNested({ each: true })
  public readonly candles!: CandleEntity[];

  constructor(candles?: CandleRaw[]) {
    if (!candles) return;

    this.candles = candles.map((candle) => new CandleEntity(candle));
  }

  toJSON() {
    return Object.assign({}, this);
  }
}

export class CandleCreatedDomainEvent extends BaseEvent<CandleCreatedDomainEventPayload> {
  override eventClass = CandleCreatedDomainEvent;

  public static override topic: string = 'candles-created';
  public override payload: CandleCreatedDomainEventPayload;

  constructor(candles: CandleRaw[]) {
    super();

    this.payload = new CandleCreatedDomainEventPayload(candles);
  }
}
