import { BaseEventPayload, BaseEvent } from '@xyro/libs/events';

import { NotificationEntity } from '../entites';

export class NotificationCreatedDomainEventPayload extends NotificationEntity implements BaseEventPayload {
  toJSON() {
    return Object.assign({}, this);
  };
}

export class NotificationCreatedDomainEvent
  extends BaseEvent<NotificationCreatedDomainEventPayload>
{

  override eventClass = NotificationCreatedDomainEvent;

  public static override topic: string = 'notifications-created';
  public override payload: NotificationCreatedDomainEventPayload;

  constructor(task: NotificationEntity) {
    super();

    this.payload = new NotificationCreatedDomainEventPayload(task)
  }
}
