import { Directive, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLEntitiesNames } from '@xyro/core';

import {
  NotificationGraphQLEntityReference
} from './references';

@ObjectType(GraphQLEntitiesNames.Notification)
@Directive('@key(fields: "id")')
export class NotificationGraphQLOrphanEntity {
  @Field()
  id: string;

  constructor(payload: NotificationGraphQLOrphanEntity) {
    this.id = payload.id;
  }

  public static createReference(id: string): NotificationGraphQLEntityReference {
    return {
      id,
      __typename: GraphQLEntitiesNames.Notification,
    }
  }
}
