import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';
import { Game1vs1 } from '@prisma/client';

import { OneVsOneGameEntity } from '../entities';

export class OneVsOneGameChangedDomainEventPayload extends OneVsOneGameEntity implements BaseEventPayload {
  toJSON() {
    return Object.assign({}, this);
  };
}

export class OneVsOneGameChangedDomainEvent extends BaseEvent<OneVsOneGameChangedDomainEventPayload> {
  override eventClass = OneVsOneGameChangedDomainEvent;

  public static override topic: string = 'one-vs-one-game-state-changed';
  public override payload: OneVsOneGameChangedDomainEventPayload;

  constructor(game: Game1vs1) {
    super();

    this.payload = new OneVsOneGameChangedDomainEventPayload(game);
  }
}
