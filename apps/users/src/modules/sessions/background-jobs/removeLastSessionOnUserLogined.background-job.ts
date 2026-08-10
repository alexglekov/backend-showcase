import { SessionCreatedDomainEvent, SessionCreatedDomainEventPayload } from '@xyro/contracts/users';
import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';
import { LoggerService } from '@xyro/libs/logger';

import { SessionsService } from '../sessions.service';

@EventsListener()
export class RemoveLastSessionOnUserLoginedBackgroundJob {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly logger: LoggerService,
  ) {}

  @SubscribeDomainEvent(SessionCreatedDomainEvent)
  async onUserLogined(@EventPayload() payload: SessionCreatedDomainEventPayload) {
    const { userId, id } = payload;

    await this.sessionsService.removeLastSessions(payload);

    this.logger.log({
      action: 'User last sessions were removed for user',
      payload: {
        userId,
        sessionId: id,
      },
    });
  }
}
