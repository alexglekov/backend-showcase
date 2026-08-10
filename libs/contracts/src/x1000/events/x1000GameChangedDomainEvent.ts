import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';
import { GameX1000 } from '@prisma/client';

import { X1000GameEntity } from '../entities';

export class X1000GameChangedDomainEventPayload extends X1000GameEntity implements BaseEventPayload {
  toJSON() {
    return Object.assign({}, this);
  };
}

export class X1000GameChangedDomainEvent extends BaseEvent<X1000GameChangedDomainEventPayload> {
  override eventClass = X1000GameChangedDomainEvent;

  public static override topic: string = 'x1000-game-state-changed';
  public override payload: X1000GameChangedDomainEventPayload;

  constructor(game: GameX1000) {
    super();

    this.payload = new X1000GameChangedDomainEventPayload(game);
  }
}
