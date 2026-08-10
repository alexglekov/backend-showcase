import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';
import { Bet, UserChallengeTask } from '@prisma/client';

import { UserChallengeTaskEntity } from '../entities';

export class UserChallengeTaskUpdatedDomainEventPayload extends UserChallengeTaskEntity implements BaseEventPayload {
  toJSON() {
    return Object.assign({}, this);
  };
}

export class UserChallengeTaskUpdatedDomainEvent extends BaseEvent<UserChallengeTaskUpdatedDomainEventPayload> {
  override eventClass = UserChallengeTaskUpdatedDomainEvent;

  public static override topic: string = 'user-challenge-task-updated';
  public override payload: UserChallengeTaskUpdatedDomainEventPayload;

  constructor(userChallengeTask: UserChallengeTask) {
    super();

    this.payload = new UserChallengeTaskUpdatedDomainEventPayload(userChallengeTask);
  }
}
