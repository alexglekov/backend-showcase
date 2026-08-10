import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';
import { BetUpDown } from '@prisma/client';

import { UpDownBetEntity } from '../entities';

export class UpDownBetChangedDomainEventPayload extends UpDownBetEntity implements BaseEventPayload {
  toJSON() {
    return Object.assign({}, this);
  };
}

export class UpDownBetChangedDomainEvent extends BaseEvent<UpDownBetChangedDomainEventPayload> {
  override eventClass = UpDownBetChangedDomainEvent;

  public static override topic: string = 'up-down-bet-state-changed';
  public override payload: UpDownBetChangedDomainEventPayload;

  constructor(bet: BetUpDown) {
    super();

    this.payload = new UpDownBetChangedDomainEventPayload(bet);
  }
}
