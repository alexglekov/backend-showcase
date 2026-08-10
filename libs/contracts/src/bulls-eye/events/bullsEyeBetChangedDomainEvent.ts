import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';
import { BetBullseye } from '@prisma/client';

import { BullsEyeBetEntity } from '../entities';

export class BullsEyeBetChangedDomainEventPayload extends BullsEyeBetEntity implements BaseEventPayload {
  toJSON() {
    return Object.assign({}, this);
  };
}

export class BullsEyeBetChangedDomainEvent extends BaseEvent<BullsEyeBetChangedDomainEventPayload> {
  override eventClass = BullsEyeBetChangedDomainEvent;

  public static override topic: string = 'bulls-eye-bet-state-changed';
  public override payload: BullsEyeBetChangedDomainEventPayload;

  constructor(bet: BetBullseye) {
    super();

    this.payload = new BullsEyeBetChangedDomainEventPayload(bet);
  }
}
