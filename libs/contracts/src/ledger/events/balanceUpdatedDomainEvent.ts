import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';
import { Balance } from '@prisma/client';

import { BalanceEntity } from '../entities';

export class BalanceUpdatedDomainEventPayload extends BalanceEntity implements BaseEventPayload {
  toJSON() {
    return Object.assign({}, this);
  };
}

export class BalanceUpdatedDomainEvent extends BaseEvent<BalanceUpdatedDomainEventPayload> {
  override eventClass = BalanceUpdatedDomainEvent;

  public static override topic: string = 'balance-updated';
  public override payload: BalanceUpdatedDomainEventPayload;

  constructor(balance: Balance) {
    super();

    this.payload = new BalanceUpdatedDomainEventPayload(balance)
  }
}
