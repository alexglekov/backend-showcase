import { X1000GameChangedDomainEvent, X1000GameChangedDomainEventPayload } from '@xyro/contracts/x1000';
import { GameStateEnum } from '@prisma/client';
import { LoggerService } from '@xyro/libs/logger';

import { X1000GameHourlyWorker } from '../workers/x1000HourlyComission.worker';
import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';

@EventsListener()
export class X1000GameObserver {
  constructor(
    protected readonly logger: LoggerService,
    private readonly x1000worker: X1000GameHourlyWorker
  ) {
    this.logger.setContext(X1000GameObserver.name);
  }

  @SubscribeDomainEvent(X1000GameChangedDomainEvent)
  async publishState(@EventPayload() payload: X1000GameChangedDomainEventPayload) {
    const { id, state } = payload;

    if (state === GameStateEnum.INPROGRESS) {
      this.x1000worker.registGame(id);
    }

    if (state === GameStateEnum.PENDING) {
      this.x1000worker.unregistGame(id);
    }
  }
}
