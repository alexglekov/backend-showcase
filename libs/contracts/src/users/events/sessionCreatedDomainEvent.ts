import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';
import { Session } from '@prisma/client';

import { SessionEntity } from '../entities';

export class SessionCreatedDomainEventPayload extends SessionEntity implements BaseEventPayload {
  toJSON() {
    return Object.assign({}, this);
  };
}

export class SessionCreatedDomainEvent extends BaseEvent<SessionCreatedDomainEventPayload> {
  override eventClass = SessionCreatedDomainEvent;

  public static override topic: string = 'session-created';
  public override payload: SessionCreatedDomainEventPayload;

  constructor(session: Session) {
    super();

    this.payload = new SessionCreatedDomainEventPayload(session);
  }
}
