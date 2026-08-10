import { Directive, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLEntitiesNames } from '@xyro/core';

import { MessageGraphQLEntityReference } from './references';

@ObjectType(GraphQLEntitiesNames.Message)
@Directive('@key(fields: "id")')
export class MessageGraphQLOrphanEntity {
  @Field()
  id: string;

  constructor(payload: MessageGraphQLOrphanEntity) {
    this.id = payload.id;
  }

  public static createReference(id: string): MessageGraphQLEntityReference {
    return {
      id,
      __typename: GraphQLEntitiesNames.Message,
    }
  }
}
