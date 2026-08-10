import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';
import { Bet } from '@prisma/client';

import { BetEntity } from '../entities';

export class HighestPnlBetCreatedDomainEventPayload extends BetEntity implements BaseEventPayload {
  toJSON() {
    return Object.assign({}, this);
  };
}

export class HighestPnlBetCreatedDomainEvent extends BaseEvent<HighestPnlBetCreatedDomainEventPayload> {
  override eventClass = HighestPnlBetCreatedDomainEvent;

  public static override topic: string = 'analytics-highest-pnl-bets';
  public override payload: HighestPnlBetCreatedDomainEventPayload;

  constructor(bet: Bet) {
    super();

    this.payload = new HighestPnlBetCreatedDomainEventPayload(bet);
  }
}
