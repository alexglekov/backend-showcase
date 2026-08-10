import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';
import { X1000BetChangedDomainEvent, X1000BetChangedDomainEventPayload } from '@xyro/contracts/x1000';
import { UpDownBetChangedDomainEvent, UpDownBetChangedDomainEventPayload } from '@xyro/contracts/up-down';
import { OneVsOneBetChangedDomainEvent, OneVsOneBetChangedDomainEventPayload } from '@xyro/contracts/one-vs-one';
import { SetupBetChangedDomainEvent, SetupBetChangedDomainEventPayload } from '@xyro/contracts/setups';
import { BullsEyeBetChangedDomainEvent, BullsEyeBetChangedDomainEventPayload } from '@xyro/contracts/bulls-eye';

import { LiveStreamOfBetsService } from './liveStreamOfBets.service';

@EventsListener()
export class LiveStreamOfBetsObserver {
  constructor(private readonly service: LiveStreamOfBetsService) {}

  @SubscribeDomainEvent(UpDownBetChangedDomainEvent)
  async onUpDownBetChanged(@EventPayload() payload: UpDownBetChangedDomainEventPayload) {
    await this.service.onBetChanged(payload);
  }

  @SubscribeDomainEvent(BullsEyeBetChangedDomainEvent)
  async onBullsEyeBetStateChanged(@EventPayload() payload: BullsEyeBetChangedDomainEventPayload) {
    await this.service.onBetChanged(payload);
  }

  @SubscribeDomainEvent(SetupBetChangedDomainEvent)
  async onSetupBetChanged(@EventPayload() payload: SetupBetChangedDomainEventPayload) {
    await this.service.onBetChanged(payload);
  }

  @SubscribeDomainEvent(OneVsOneBetChangedDomainEvent)
  async onOneVsOneBetChanged(@EventPayload() payload: OneVsOneBetChangedDomainEventPayload) {
    await this.service.onBetChanged(payload);
  }

  @SubscribeDomainEvent(X1000BetChangedDomainEvent)
  async onX1000BetChanged(@EventPayload() payload: X1000BetChangedDomainEventPayload) {
    await this.service.onBetChanged(payload);
  }
}