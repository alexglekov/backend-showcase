import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';
import { Message } from '@prisma/client';

import { MessageEntity } from '../entities';

export class MessageCreatedDomainEventPayload extends MessageEntity implements BaseEventPayload {
  toJSON() {
    return Object.assign({}, this);
  };
}

export class MessageCreatedDomainEvent extends BaseEvent<MessageCreatedDomainEventPayload> {
  override eventClass = MessageCreatedDomainEvent;

  public static override topic: string = 'chat-messages';
  public override payload: MessageCreatedDomainEventPayload;

  constructor(message: Message) {
    super();

    this.payload = new MessageCreatedDomainEventPayload(message)
  }
}
