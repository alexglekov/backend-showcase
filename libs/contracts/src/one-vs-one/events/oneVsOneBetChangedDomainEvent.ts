import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';
import { Bet1vs1 } from '@prisma/client';

import { OneVsOneBetEntity } from '../entities';

export class OneVsOneBetChangedDomainEventPayload extends OneVsOneBetEntity implements BaseEventPayload {
  toJSON() {
    return Object.assign({}, this);
  };
}

export class OneVsOneBetChangedDomainEvent extends BaseEvent<OneVsOneBetChangedDomainEventPayload> {
  override eventClass = OneVsOneBetChangedDomainEvent;

  public static override topic: string = 'one-vs-one-bet-state-changed';
  public override payload: OneVsOneBetChangedDomainEventPayload;

  constructor(bet: Bet1vs1) {
    super();

    this.payload = new OneVsOneBetChangedDomainEventPayload(bet);
  }
}
