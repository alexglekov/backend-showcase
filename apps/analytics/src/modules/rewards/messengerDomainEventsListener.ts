import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';
import { MessageCreatedDomainEvent, MessageCreatedDomainEventPayload } from '@xyro/contracts/messenger';

import { ChallengeTasksHandler } from './handlers/challengeTaskHandler';

@EventsListener()
export class MessengerDomainEventListener {
  constructor(
    private readonly challengeTasksHandler: ChallengeTasksHandler,
  ) {}

  @SubscribeDomainEvent(MessageCreatedDomainEvent)
  async onMessageCreated(@EventPayload() payload: MessageCreatedDomainEventPayload) {
    await this.challengeTasksHandler.handleByEvent(MessageCreatedDomainEvent, payload);
  }
}
