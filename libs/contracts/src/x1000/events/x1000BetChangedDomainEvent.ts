import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';
import { BetX1000 } from '@prisma/client';

import { X1000BetEntity } from '../entities';

export class X1000BetChangedDomainEventPayload extends X1000BetEntity implements BaseEventPayload {
  toJSON() {
    return Object.assign({}, this);
  };
}

export class X1000BetChangedDomainEvent extends BaseEvent<X1000BetChangedDomainEventPayload> {
  override eventClass = X1000BetChangedDomainEvent;

  public static override topic: string = 'x1000-bet-state-changed';
  public override payload: X1000BetChangedDomainEventPayload;

  constructor(bet: BetX1000) {
    super();

    this.payload = new X1000BetChangedDomainEventPayload(bet);
  }
}
