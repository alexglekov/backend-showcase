import {
  SyncUserLikesTaskEvent,
  SyncUserLikesTaskEventPayload,
  SyncUserRetweetsTaskEvent,
  SyncUserRetweetsTaskEventPayload
} from '@xyro/contracts/twitter';
import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';
import { TwitterIndexerService } from './twitterIndexer.service';

@EventsListener()
export class TwitterIndexerTaskEventsListener {
  constructor(
    private readonly twitterIndexerService: TwitterIndexerService
  ) {}

  @SubscribeDomainEvent(SyncUserLikesTaskEvent)
  async onSyncUserLikesTaskEvent(@EventPayload() payload: SyncUserLikesTaskEventPayload) {
    await this.twitterIndexerService.onSyncUserLikesTaskEvent(payload);
  }

  @SubscribeDomainEvent(SyncUserRetweetsTaskEvent)
  async onSyncUserRetweetsTaskEvent(@EventPayload() payload: SyncUserRetweetsTaskEventPayload) {
    await this.twitterIndexerService.onSyncUserRetweetsTaskEvent(payload);
  }
}
