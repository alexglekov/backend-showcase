import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';
import { Reward } from '@prisma/client';

import { RewardEntity } from '../entities';

export class RewardUpdatedDomainEventPayload extends RewardEntity implements BaseEventPayload {
  toJSON() {
    return Object.assign({}, this);
  };
}

export class RewardUpdatedDomainEvent extends BaseEvent<RewardUpdatedDomainEventPayload> {
  override eventClass = RewardUpdatedDomainEvent;

  public static override topic: string = 'reward-updated';
  public override payload: RewardUpdatedDomainEventPayload;

  constructor(reward: Reward) {
    super();

    this.payload = new RewardUpdatedDomainEventPayload(reward);
  }
}
