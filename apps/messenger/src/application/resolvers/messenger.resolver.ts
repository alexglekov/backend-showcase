import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';

import { MessengerService } from '../messenger.service';
import { MessageGraphQLEntity } from './models/messageGraphqlEntity.model';
import { RoomGraphQLEntity } from './models/roomGraphqlEntity.model';
import { GetRoomMessagesPaginatedInput, SendMessageInput } from './models/graphqlModels.types';

@Resolver()
export class MessengerResolver {
  constructor(
    private readonly messengerService: MessengerService,
  ) {}

  @Mutation(() => MessageGraphQLEntity)
  async sendMessage(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') data: SendMessageInput,
  ): Promise<MessageGraphQLEntity> {
    const { userId } = credentials;

    const message = await this.messengerService.createMessage({
      ...data,
      userId
    });

    return new MessageGraphQLEntity(message);
  }

  @Query(() => [MessageGraphQLEntity])
  async getRoomMessagesPaginated(
    @Args('data') data: GetRoomMessagesPaginatedInput,
  ): Promise<MessageGraphQLEntity[]> {
    const messages = await this.messengerService.getRoomMessages(data);

    return messages.map((message) => new MessageGraphQLEntity(message));
  }

  @Query(() => MessageGraphQLEntity)
  async getMessageById(
    @Args('id') id: string,
  ): Promise<MessageGraphQLEntity> {
    const message = await this.messengerService.getMessageByIdOrThrow(id);

    return new MessageGraphQLEntity(message);
  }

  @Query(() => RoomGraphQLEntity)
  async getGlobalRoom(): Promise<RoomGraphQLEntity> {
    const globalRoom = await this.messengerService.getGlobalRoom();

    return new RoomGraphQLEntity(globalRoom);
  }
}
