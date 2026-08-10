import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { IUserCredentials, PaginatedGraphQLInput, UserCredentials, Void } from '@xyro/libs/graphql';

import { NotificationsService } from '../notifications.service';
import { MarkNotificationsAsReadInput, NotificationsPaginatedGraphQLEntity } from './models/graphqlModels';
import { NotificationGraphQLEntity, getNotificationClass } from './models/notificationGraphql.model';

@Resolver()
export class NotificationsResolver {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Query(() => NotificationsPaginatedGraphQLEntity)
  async getNotifications(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') payload: PaginatedGraphQLInput,
  ): Promise<NotificationsPaginatedGraphQLEntity> {
    const { userId } = credentials;

    const {
      notifications,
      skip,
      take,
      total
    } = await this.notificationsService.getUserNotifications({
      userId,
      ...payload,
    });

    return new NotificationsPaginatedGraphQLEntity(notifications, take, skip, total);
  }

  @Query(() => NotificationGraphQLEntity)
  async getNotificationById(
    @Args('id') id: string,
  ): Promise<typeof NotificationGraphQLEntity> {
    const notification = await this.notificationsService.getNotificationById(id);

    const GraphQLEntityConstructor = getNotificationClass(notification.type);

    return new GraphQLEntityConstructor(notification);
  }

  @Query(() => Int)
  getUnreadNotificationsCount(
    @UserCredentials() credentials: IUserCredentials,
  ) {
    const { userId } = credentials;

    return this.notificationsService.getUnreadNotificationsCount({
      userId,
    });
  }

  @Mutation(() => Void, { nullable: true })
  async markNotificationsRead(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') payload: MarkNotificationsAsReadInput,
  ) {
    const { userId } = credentials;

    await this.notificationsService.markUserNotificationsAsRead({
      userId,
      ids: payload.ids,
    });

    return true;
  }
}