import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';
import { User } from '@prisma/client';

import { UserEntity } from '../entities';

export class UserUpdatedDomainEventPayload extends UserEntity implements BaseEventPayload {
  toJSON() {
    return Object.assign({}, this);
  };
}

export class UserUpdatedDomainEvent extends BaseEvent<UserUpdatedDomainEventPayload> {
  override eventClass = UserUpdatedDomainEvent;

  public static override topic: string = 'user-updated';
  public override payload: UserUpdatedDomainEventPayload;

  constructor(user: User) {
    super();

    this.payload = new UserUpdatedDomainEventPayload(user);
  }
}
