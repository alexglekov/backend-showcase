import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';
import { BetSetup } from '@prisma/client';

import { SetupBetEntity } from '../entities';

export class SetupBetChangedDomainEventPayload extends SetupBetEntity implements BaseEventPayload {
  toJSON() {
    return Object.assign({}, this);
  };
}

export class SetupBetChangedDomainEvent extends BaseEvent<SetupBetChangedDomainEventPayload> {
  override eventClass = SetupBetChangedDomainEvent;

  public static override topic: string = 'setup-bet-state-changed';
  public override payload: SetupBetChangedDomainEventPayload;

  constructor(bet: BetSetup) {
    super();

    this.payload = new SetupBetChangedDomainEventPayload(bet);
  }
}
