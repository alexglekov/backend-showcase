import { Directive, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLEntitiesNames } from '@xyro/core';
import { UserV2 } from 'twitter-api-v2';

@ObjectType(GraphQLEntitiesNames.TwitterAccount)
@Directive('@key(fields: "id")')
export class TwitterAccountGraphQLOrphanEntity {
  @Field()
  public readonly id: string;

  public readonly __typename: GraphQLEntitiesNames;

  constructor(entity: Pick<UserV2, 'id'>) {
    this.id = entity.id;
    this.__typename = GraphQLEntitiesNames.TwitterAccount;
  }
}
