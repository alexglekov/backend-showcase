import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';
import { UpDownGameChangedDomainEvent, UpDownGameChangedDomainEventPayload } from '@xyro/contracts/up-down';
import { OneVsOneGameChangedDomainEvent, OneVsOneGameChangedDomainEventPayload } from '@xyro/contracts/one-vs-one';
import { X1000GameChangedDomainEvent, X1000GameChangedDomainEventPayload } from '@xyro/contracts/x1000';
import { BullsEyeGameChangedDomainEvent, BullsEyeGameChangedDomainEventPayload } from '@xyro/contracts/bulls-eye';
import { SetupGameChangedDomainEvent, SetupGameChangedDomainEventPayload } from '@xyro/contracts/setups';

import { GamesRewardsService } from './gamesRewards.service';

@EventsListener()
export class GamesDomainEventsListener {
  constructor(
    private readonly gamesRewardsService: GamesRewardsService,
  ) {}

  @SubscribeDomainEvent(UpDownGameChangedDomainEvent)
  async onUpDownGameChanged(@EventPayload() payload: UpDownGameChangedDomainEventPayload) {
    await this.gamesRewardsService.giveRewardsForUpDownGame(payload);
  }

  @SubscribeDomainEvent(OneVsOneGameChangedDomainEvent)
  async onOneVsOneGameChanged(@EventPayload() payload: OneVsOneGameChangedDomainEventPayload) {
    await this.gamesRewardsService.giveRewardsForOneVsOne(payload);
  }

  @SubscribeDomainEvent(X1000GameChangedDomainEvent)
  async onX1000GameChanged(@EventPayload() payload: X1000GameChangedDomainEventPayload) {
    await this.gamesRewardsService.giveRewardsForX1000Game(payload);
  }

  @SubscribeDomainEvent(BullsEyeGameChangedDomainEvent)
  async onBullsEyeGameChanged(@EventPayload() payload: BullsEyeGameChangedDomainEventPayload) {
    await this.gamesRewardsService.giveRewardsForBullsEye(payload);
  }

  @SubscribeDomainEvent(SetupGameChangedDomainEvent)
  async onSetupGameChanged(@EventPayload() payload: SetupGameChangedDomainEventPayload) {
    await this.gamesRewardsService.giveRewardsForSetups(payload);
  }
}
