import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';
import { Bet } from '@prisma/client';

import { BetEntity } from '../entities';

export class HighWagerBetCreatedDomainEventPayload extends BetEntity implements BaseEventPayload {
  toJSON() {
    return Object.assign({}, this);
  };
}

export class HighWagerBetCreatedDomainEvent extends BaseEvent<HighWagerBetCreatedDomainEventPayload> {
  override eventClass = HighWagerBetCreatedDomainEvent;

  public static override topic: string = 'analytics-high-wager-bets';
  public override payload: HighWagerBetCreatedDomainEventPayload;

  constructor(bet: Bet) {
    super();

    this.payload = new HighWagerBetCreatedDomainEventPayload(bet);
  }
}
