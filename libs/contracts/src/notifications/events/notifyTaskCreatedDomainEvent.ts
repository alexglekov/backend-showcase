import { BaseEventPayload, BaseEvent } from '@xyro/libs/events';

import { NotifyTaskPayload, NotifyTaskType } from '../entites/send-notifications';

export class NotifyTaskCreatedDomainEventPayload<NT extends NotifyTaskType = NotifyTaskType>
  extends NotifyTaskPayload<NT>
  implements BaseEventPayload
{
  toJSON() {
    return Object.assign({}, this);
  };
}

export class NotifyTaskCreatedDomainEvent<NT extends NotifyTaskType>
  extends BaseEvent<NotifyTaskCreatedDomainEventPayload<NT>>
{

  override eventClass = NotifyTaskCreatedDomainEvent;

  public static override topic: string = 'send-notifications-tasks';
  public override payload: NotifyTaskCreatedDomainEventPayload<NT>;

  constructor(task: NotifyTaskPayload<NT>) {
    super();

    this.payload = new NotifyTaskCreatedDomainEventPayload(task)
  }
}
