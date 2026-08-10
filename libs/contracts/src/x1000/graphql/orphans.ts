import { Directive, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLEntitiesNames } from '@xyro/core';

import {
  X1000BetGraphQLEntityReference,
  X1000GameGraphQLEntityReference,
} from './references';

@ObjectType(GraphQLEntitiesNames.X1000Game)
@Directive('@key(fields: "id")')
export class X1000GameGraphQLOrphanEntity {
  @Field()
  public id: string;

  constructor(payload: X1000GameGraphQLOrphanEntity) {
    this.id = payload.id;
  }

  public static createReference(id: string): X1000GameGraphQLEntityReference {
    return {
      id,
      __typename: GraphQLEntitiesNames.X1000Game,
    }
  }
}

@ObjectType(GraphQLEntitiesNames.X1000Bet)
@Directive('@key(fields: "id")')
export class X1000BetGraphQLOrphanEntity {
  @Field()
  public id: string;

  constructor(payload: X1000BetGraphQLOrphanEntity) {
    this.id = payload.id;
  }

  public static createReference(id: string): X1000BetGraphQLEntityReference {
    return {
      id,
      __typename: GraphQLEntitiesNames.X1000Bet,
    }
  }
}
