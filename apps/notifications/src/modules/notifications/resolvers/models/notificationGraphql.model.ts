import { createUnionType } from '@nestjs/graphql';
import { GraphQLEntitiesNames } from '@xyro/core';
import { NotificationType } from '@prisma/client';
import { InternalServerErrorException } from '@nestjs/common';

import { BaseNotificationGraphqlEntity } from './baseNotification.model';
import { MentionNotificationGraphqlEntity } from './mentionNotificationGraphql.model';
import { GameResultNotificationGraphqlEntity } from '../../../games/models/gameResultNotification.model';

export const NotificationGraphQLEntity = createUnionType({
  types: () => [
    GameResultNotificationGraphqlEntity,
    MentionNotificationGraphqlEntity,
  ],
  description: 'Supported notifications',
  name: GraphQLEntitiesNames.Notification,
  resolveType: (value: BaseNotificationGraphqlEntity) => {
    const { type } = value;

    return getNotificationClass(type);
  }
});

export function getNotificationClass(type: NotificationType): new (...args: any[]) => typeof NotificationGraphQLEntity {
  if (type === NotificationType.gameResult) return GameResultNotificationGraphqlEntity;
  if (type === NotificationType.mention) return MentionNotificationGraphqlEntity;

  throw new InternalServerErrorException(`UnexpectedError: unsupported game type ${type}`);
}
