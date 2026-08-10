import { Field, ObjectType } from '@nestjs/graphql';
import { GameTypeEnum, NotificationType, Notifications } from '@prisma/client';
import { GraphQLEntitiesNames } from '@xyro/core';

import { GameResultNotificationPayloadGraphQLEntity, getGameResultPayloadClass } from './gameResultNotificationPayload.model';
import { BaseNotificationGraphqlEntity } from '../../notifications/resolvers/models/baseNotification.model';

@ObjectType(GraphQLEntitiesNames.GameResultNotification)
export class GameResultNotificationGraphqlEntity extends BaseNotificationGraphqlEntity {
  @Field(() => GameResultNotificationPayloadGraphQLEntity)
  payload: typeof GameResultNotificationPayloadGraphQLEntity;

  constructor(entity: Notifications) {
    super(entity);

    this.type = NotificationType.gameResult;
    this.payload = GameResultNotificationGraphqlEntity.createPayload(entity);
  }

  static createPayload(entity: Notifications): typeof GameResultNotificationPayloadGraphQLEntity {
    const { gameType } = entity.body as { gameType: GameTypeEnum };
    const GraphQLEntityConstructor = getGameResultPayloadClass(gameType);

    return new GraphQLEntityConstructor(entity.body);
  }
}
