import { Resolver, Subscription } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';

import { NotificationsPayload, PubSubService } from '../../../infrastructure/pub-sub';
import { NotificationGraphQLOrphanEntity } from './notificationStateGraphQLEntity';

@Resolver()
export class NotificationsSubscriptionsResolver {
  constructor(private readonly pubSubService: PubSubService) {}

  @Subscription(() => NotificationGraphQLOrphanEntity)
  notifications(
    @UserCredentials() credentials: IUserCredentials
  ): AsyncIterator<NotificationsPayload> {
    const { userId } = credentials;

    return this.pubSubService.notifications(userId);
  }
}
