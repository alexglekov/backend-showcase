import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';
import { Referral, User } from '@prisma/client';
import { IsOptional, IsString, IsUUID } from 'class-validator';

import { UserEntity } from '../entities';

export class UserCreatedDomainEventPayload extends UserEntity implements BaseEventPayload {
  @IsString()
  @IsUUID('4')
  @IsOptional()
  public readonly referrerId?: string

  constructor(user?: User, referral?: Referral) {
    super(user);

    this.referrerId = referral?.userId || undefined;
  }

  toJSON() {
    return Object.assign({}, this);
  };
}

export class UserCreatedDomainEvent extends BaseEvent<UserCreatedDomainEventPayload> {
  override eventClass = UserCreatedDomainEvent;

  public static override topic: string = 'user-created';
  public override payload: UserCreatedDomainEventPayload;

  constructor(user: User, referral?: Referral) {
    super();

    this.payload = new UserCreatedDomainEventPayload(user, referral);
  }
}
