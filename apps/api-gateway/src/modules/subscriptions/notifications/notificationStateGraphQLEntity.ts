import { ObjectType, createUnionType } from '@nestjs/graphql';
import { NotificationEntity } from '@xyro/contracts/notifications';
import { GraphQLEntitiesNames } from '@xyro/core';

@ObjectType(GraphQLEntitiesNames.HotNotification)
class HotNotificationGraphQLEntity extends NotificationEntity {
}

export const NotificationGraphQLOrphanEntity = createUnionType({
  name: GraphQLEntitiesNames.Notification,
  types: () => [HotNotificationGraphQLEntity],
});
