import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';
import { UpDownGameChangedDomainEvent, UpDownGameChangedDomainEventPayload } from '@xyro/contracts/up-down';
import { OneVsOneGameChangedDomainEvent, OneVsOneGameChangedDomainEventPayload } from '@xyro/contracts/one-vs-one';
import { X1000GameChangedDomainEvent, X1000GameChangedDomainEventPayload } from '@xyro/contracts/x1000';
import { BullsEyeGameChangedDomainEvent, BullsEyeGameChangedDomainEventPayload } from '@xyro/contracts/bulls-eye';
import { SetupGameChangedDomainEvent, SetupGameChangedDomainEventPayload } from '@xyro/contracts/setups';

import { ChallengeTasksHandler } from './handlers/challengeTaskHandler';

@EventsListener()
export class GamesDomainEventsListener {
  constructor(
    private readonly challengeTasksHandler: ChallengeTasksHandler,
  ) {}

  @SubscribeDomainEvent(UpDownGameChangedDomainEvent)
  async onUpDownGameChanged(@EventPayload() payload: UpDownGameChangedDomainEventPayload) {
    await this.challengeTasksHandler.handleByEvent(UpDownGameChangedDomainEvent, payload);
  }

  @SubscribeDomainEvent(OneVsOneGameChangedDomainEvent)
  async onOneVsOneGameChanged(@EventPayload() payload: OneVsOneGameChangedDomainEventPayload) {
    await this.challengeTasksHandler.handleByEvent(OneVsOneGameChangedDomainEvent, payload);
  }

  @SubscribeDomainEvent(X1000GameChangedDomainEvent)
  async onX1000GameChanged(@EventPayload() payload: X1000GameChangedDomainEventPayload) {
    await this.challengeTasksHandler.handleByEvent(X1000GameChangedDomainEvent, payload);
  }

  @SubscribeDomainEvent(BullsEyeGameChangedDomainEvent)
  async onBullsEyeGameChanged(@EventPayload() payload: BullsEyeGameChangedDomainEventPayload) {
    await this.challengeTasksHandler.handleByEvent(BullsEyeGameChangedDomainEvent, payload);
  }

  @SubscribeDomainEvent(SetupGameChangedDomainEvent)
  async onSetupGameChanged(@EventPayload() payload: SetupGameChangedDomainEventPayload) {
    await this.challengeTasksHandler.handleByEvent(SetupGameChangedDomainEvent, payload);
  }
}
