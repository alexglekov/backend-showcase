import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';

import { MessageGraphQLEntity } from './models/messageGraphqlEntity.model';
import { MessengerService } from '../messenger.service';

@Resolver(() => MessageGraphQLEntity)
export class MessageGraphQLEntityResolver {
  constructor(private readonly messengerService: MessengerService) {}

  // TODO: n+1 problem
  @ResolveField(() => MessageGraphQLEntity, { name: 'replyTo', nullable: true })
  async replyTo(@Parent() message: MessageGraphQLEntity): Promise<MessageGraphQLEntity | null> {
    const { fetchedReplyToFromDb } = message;

    if (fetchedReplyToFromDb) return new MessageGraphQLEntity(fetchedReplyToFromDb);

    if (message.replyToId) {
      const foundMessage = await this.messengerService.getMessageById(message.replyToId);

      if (foundMessage) return new MessageGraphQLEntity(foundMessage);
    }

    return null;
  }

  @ResolveField(() => UserGraphQLOrphanEntity, { name: 'sender', nullable: true })
  sender(@Parent() message: MessageGraphQLEntity) {
    return new UserGraphQLOrphanEntity({
      id: message.senderId,
      request: [],
    });
  }
}
