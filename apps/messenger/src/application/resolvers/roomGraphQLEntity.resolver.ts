import { ResolveField, Resolver } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';

import { MessengerService } from '../messenger.service';
import { AllowanceSendingMessageGraphQLEntity, RoomGraphQLEntity } from './models/roomGraphqlEntity.model';

@Resolver(() => RoomGraphQLEntity)
export class RoomGraphQLEntityResolver {
  constructor(private readonly messengerService: MessengerService) {}

  @ResolveField(() => AllowanceSendingMessageGraphQLEntity, { name: 'allowanceSendingMessage' })
  async allowanceSendingMessage(@UserCredentials(false) credentials?: IUserCredentials): Promise<AllowanceSendingMessageGraphQLEntity> {
    if (!credentials) return { blockingReason: 'Unauthorized.', isAllowed: false };

    const { userId } = credentials;

    const { userIsBlocked, reasonForBlocking } = await this.messengerService.checkUserAllowSendMessage(userId);

    return {
      blockingReason: reasonForBlocking,
      isAllowed: !userIsBlocked,
    }
  }
}
