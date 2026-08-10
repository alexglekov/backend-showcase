import { PaginatedGraphQLOutput } from '@xyro/libs/graphql';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Notifications } from '@prisma/client';

import { NotificationGraphQLEntity, getNotificationClass } from './notificationGraphql.model';

@ObjectType('NotificationsPaginated')
export class NotificationsPaginatedGraphQLEntity extends PaginatedGraphQLOutput {
  @Field(() => [NotificationGraphQLEntity])
  notifications: typeof NotificationGraphQLEntity[];

  constructor(entities: Notifications[], take: number, skip: number, total: number) {
    super();

    this.skip = skip;
    this.take = take;
    this.total = total;
    this.notifications = NotificationsPaginatedGraphQLEntity.createNotifications(entities);
  }

  static createNotifications(entities: Notifications[]): typeof NotificationGraphQLEntity[] {
    const notifications: typeof NotificationGraphQLEntity[] = [];

    for (const entity of entities) {
      const GraphQLEntityConstructor = getNotificationClass(entity.type);

      notifications.push(
        new GraphQLEntityConstructor(entity)
      );
    }

    return notifications;
  }
}

@InputType()
export class MarkNotificationsAsReadInput {
  @Field(() => [String], { nullable: true })
  ids?: string[]
}