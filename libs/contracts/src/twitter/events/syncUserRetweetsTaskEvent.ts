import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

type SyncUserRetweetsTask = {
  twitterId: string;
  tweetId: string;
}

export class SyncUserRetweetsTaskEventPayload implements BaseEventPayload {
  @IsString()
  @IsNotEmpty()
  public readonly tweetId!: string;

  @IsString()
  @IsNotEmpty()
  public readonly twitterId!: string;

  constructor(payload?: SyncUserRetweetsTask) {
    if (!payload) return;

    this.tweetId = payload.tweetId;
    this.twitterId = payload.twitterId;
  }

  toJSON() {
    return Object.assign({}, this);
  };
}

export class SyncUserRetweetsTaskEvent extends BaseEvent<SyncUserRetweetsTaskEventPayload> {
  override eventClass = SyncUserRetweetsTaskEvent;

  public static override topic: string = 'sync-user-retweets-tasks';
  public override payload: SyncUserRetweetsTaskEventPayload;

  constructor(payload: SyncUserRetweetsTask) {
    super();

    this.payload = new SyncUserRetweetsTaskEventPayload(payload);
  }
}
