import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';
import { GameBullseye } from '@prisma/client';

import { BullsEyeGameEntity } from '../entities';

export class BullsEyeGameChangedDomainEventPayload extends BullsEyeGameEntity implements BaseEventPayload {
  toJSON() {
    return Object.assign({}, this);
  };
}

export class BullsEyeGameChangedDomainEvent extends BaseEvent<BullsEyeGameChangedDomainEventPayload> {
  override eventClass = BullsEyeGameChangedDomainEvent;

  public static override topic: string = 'bulls-eye-game-state-changed';
  public override payload: BullsEyeGameChangedDomainEventPayload;

  constructor(game: GameBullseye) {
    super();

    this.payload = new BullsEyeGameChangedDomainEventPayload(game);
  }
}
