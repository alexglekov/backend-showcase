import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';
import { UpDownGameChangedDomainEvent, UpDownGameChangedDomainEventPayload } from '@xyro/contracts/up-down';
import { X1000GameChangedDomainEvent, X1000GameChangedDomainEventPayload } from '@xyro/contracts/x1000';
import { SetupGameChangedDomainEvent, SetupGameChangedDomainEventPayload } from '@xyro/contracts/setups';
import { BullsEyeGameChangedDomainEvent, BullsEyeGameChangedDomainEventPayload } from '@xyro/contracts/bulls-eye';
import { OneVsOneGameChangedDomainEvent, OneVsOneGameChangedDomainEventPayload } from '@xyro/contracts/one-vs-one';

import { GamesNotificationsService } from './gamesNotifications.service';

@EventsListener()
export class GamesStateObserver {
  constructor(private readonly notificationsService: GamesNotificationsService) {}

  @SubscribeDomainEvent(UpDownGameChangedDomainEvent)
  async onUpDownGameChanged(@EventPayload() payload: UpDownGameChangedDomainEventPayload) {
    await this.notificationsService.onUpDownGameChanged(payload);
  }

  @SubscribeDomainEvent(X1000GameChangedDomainEvent)
  async onX1000GameChanged(@EventPayload() payload: X1000GameChangedDomainEventPayload) {
    await this.notificationsService.onX1000GameChanged(payload);
  }

  @SubscribeDomainEvent(BullsEyeGameChangedDomainEvent)
  async onBullsEyeGamesStateChanged(@EventPayload() payload: BullsEyeGameChangedDomainEventPayload) {
    await this.notificationsService.onBullsEyeGameChanged(payload);
  }

  @SubscribeDomainEvent(OneVsOneGameChangedDomainEvent)
  async onOneVsOneGameChanged(@EventPayload() payload: OneVsOneGameChangedDomainEventPayload) {
    await this.notificationsService.onOneVsOneGameChanged(payload);
  }

  @SubscribeDomainEvent(SetupGameChangedDomainEvent)
  async onSetupGameChanged(@EventPayload() payload: SetupGameChangedDomainEventPayload) {
    await this.notificationsService.onSetupGameChanged(payload);
  }
}