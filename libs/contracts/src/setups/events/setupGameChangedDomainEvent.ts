import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';
import { GameSetup } from '@prisma/client';

import { SetupGameEntity } from '../entities';

export class SetupGameChangedDomainEventPayload extends SetupGameEntity implements BaseEventPayload {
  toJSON() {
    return Object.assign({}, this);
  };
}

export class SetupGameChangedDomainEvent extends BaseEvent<SetupGameChangedDomainEventPayload> {
  override eventClass = SetupGameChangedDomainEvent;

  public static override topic: string = 'setup-game-state-changed';
  public override payload: SetupGameChangedDomainEventPayload;

  constructor(game: GameSetup) {
    super();

    this.payload = new SetupGameChangedDomainEventPayload(game);
  }
}
