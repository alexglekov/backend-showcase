import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';
import { Bet } from '@prisma/client';

import { BetEntity } from '../entities';

export class LuckyBetCreatedDomainEventPayload extends BetEntity implements BaseEventPayload {
  toJSON() {
    return Object.assign({}, this);
  };
}

export class LuckyBetCreatedDomainEvent extends BaseEvent<LuckyBetCreatedDomainEventPayload> {
  override eventClass = LuckyBetCreatedDomainEvent;

  public static override topic: string = 'analytics-lucky-bets';
  public override payload: LuckyBetCreatedDomainEventPayload;

  constructor(bet: Bet) {
    super();

    this.payload = new LuckyBetCreatedDomainEventPayload(bet);
  }
}
