import { SetupGameChangedDomainEvent, SetupGameChangedDomainEventPayload } from '@xyro/contracts/setups';
import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';

import { SetupGamesFinalizerService } from './setupGamesResolver.service';

@EventsListener()
export class SetupGamesFinalizerObserver {
  constructor(
    private readonly service: SetupGamesFinalizerService
  ) {}

  @SubscribeDomainEvent(SetupGameChangedDomainEvent)
  async onGameChanged(@EventPayload() payload: SetupGameChangedDomainEventPayload) {
    await this.service.onSetupGameStateChanged(payload);
  }
}
