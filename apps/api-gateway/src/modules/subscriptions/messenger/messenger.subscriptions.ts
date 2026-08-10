import { Args, Resolver, Subscription } from '@nestjs/graphql';
import { MessageGraphQLOrphanEntity } from '@xyro/contracts/messenger';

import { PubSubService, MessageStatePayload } from '../../../infrastructure/pub-sub';

@Resolver()
export class MessengerSubscriptionsResolver {
  constructor(
    private readonly pubSubService: PubSubService,
  ) {}

  @Subscription(() => MessageGraphQLOrphanEntity)
  roomMessages(@Args('roomId') roomId: string): AsyncIterator<MessageStatePayload> {
    return this.pubSubService.roomMessages(roomId);
  }
}
