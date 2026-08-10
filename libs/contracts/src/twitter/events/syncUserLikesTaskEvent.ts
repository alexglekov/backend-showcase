import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

type SyncUserLikesTask = {
  twitterId: string;
  tweetId: string;
}

export class SyncUserLikesTaskEventPayload implements BaseEventPayload {
  @IsString()
  @IsNotEmpty()
  public readonly tweetId!: string;

  @IsString()
  @IsNotEmpty()
  public readonly twitterId!: string;

  constructor(payload?: SyncUserLikesTask) {
    if (!payload) return;

    this.tweetId = payload.tweetId;
    this.twitterId = payload.twitterId;
  }

  toJSON() {
    return Object.assign({}, this);
  };
}

export class SyncUserLikesTaskEvent extends BaseEvent<SyncUserLikesTaskEventPayload> {
  override eventClass = SyncUserLikesTaskEvent;

  public static override topic: string = 'sync-user-likes-tasks';
  public override payload: SyncUserLikesTaskEventPayload;

  constructor(payload: SyncUserLikesTask) {
    super();

    this.payload = new SyncUserLikesTaskEventPayload(payload);
  }
}
