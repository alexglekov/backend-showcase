import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';
import { GameUpDown } from '@prisma/client';

import { UpDownGameEntity } from '../entities';

export class UpDownGameChangedDomainEventPayload extends UpDownGameEntity implements BaseEventPayload {
  toJSON() {
    return Object.assign({}, this);
  };
}

export class UpDownGameChangedDomainEvent extends BaseEvent<UpDownGameChangedDomainEventPayload> {
  override eventClass = UpDownGameChangedDomainEvent;

  public static override topic: string = 'up-down-game-state-changed';
  public override payload: UpDownGameChangedDomainEventPayload;

  constructor(game: GameUpDown) {
    super();

    this.payload = new UpDownGameChangedDomainEventPayload(game);
  }
}
