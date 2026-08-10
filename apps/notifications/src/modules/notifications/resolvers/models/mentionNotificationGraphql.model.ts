import { Field, ObjectType } from '@nestjs/graphql';
import { Notifications } from '@prisma/client';
import { GraphQLEntitiesNames } from '@xyro/core';

import { BaseNotificationGraphqlEntity } from './baseNotification.model';

type MentionNotificationBody = {
  messageId: string;
}

@ObjectType(GraphQLEntitiesNames.MentionNotification)
export class MentionNotificationGraphqlEntity extends BaseNotificationGraphqlEntity {
  @Field()
  messageId: string;

  constructor(entity: Notifications) {
    super(entity)

    const { messageId } = entity.body as MentionNotificationBody;

    this.messageId = messageId;
  }
}