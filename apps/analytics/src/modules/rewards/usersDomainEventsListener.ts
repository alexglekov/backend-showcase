import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';
import {
  UserCreatedDomainEvent,
  UserCreatedDomainEventPayload,
  UserUpdatedDomainEvent,
  UserUpdatedDomainEventPayload
} from '@xyro/contracts/users';

import { ChallengeTasksHandler } from './handlers/challengeTaskHandler';

@EventsListener()
export class UsersDomainEventsListener {
  constructor(
    private readonly challengeTasksHandler: ChallengeTasksHandler,
  ) {}

  @SubscribeDomainEvent(UserCreatedDomainEvent)
  async onUserCreated(@EventPayload() payload: UserCreatedDomainEventPayload) {
    await this.challengeTasksHandler.handleByEvent(UserCreatedDomainEvent, payload);
  }

  @SubscribeDomainEvent(UserUpdatedDomainEvent)
  async onUserUpdated(@EventPayload() payload: UserUpdatedDomainEventPayload) {
    await this.challengeTasksHandler.handleByEvent(UserUpdatedDomainEvent, payload);
  }
}
