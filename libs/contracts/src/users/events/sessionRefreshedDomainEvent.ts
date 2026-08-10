import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';
import { Session } from '@prisma/client';

import { SessionEntity } from '../entities';

export class SessionRefreshedDomainEventPayload extends SessionEntity implements BaseEventPayload {
  toJSON() {
    return Object.assign({}, this);
  };
}

export class SessionRefreshedDomainEvent extends BaseEvent<SessionRefreshedDomainEventPayload> {
  override eventClass = SessionRefreshedDomainEvent;

  public static override topic: string = 'session-refreshed';
  public override payload: SessionRefreshedDomainEventPayload;

  constructor(session: Session) {
    super();

    this.payload = new SessionRefreshedDomainEventPayload(session);
  }
}
