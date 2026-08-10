import { Directive, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLEntitiesNames } from '@xyro/core';

import {
  OneVsOneBetGraphQLEntityReference,
  OneVsOneGameGraphQLEntityReference
} from './references';

@ObjectType(GraphQLEntitiesNames.OneVsOneGame)
@Directive('@key(fields: "id")')
export class OneVsOneGameGraphQLOrphanEntity {
  @Field()
  id: string;

  constructor(payload: OneVsOneGameGraphQLOrphanEntity) {
    this.id = payload.id;
  }

  public static createReference(id: string): OneVsOneGameGraphQLEntityReference {
    return {
      id,
      __typename: GraphQLEntitiesNames.OneVsOneGame,
    }
  }
}

@ObjectType(GraphQLEntitiesNames.OneVsOneBet)
@Directive('@key(fields: "id")')
export class OneVsOneBetGraphQLOrphanEntity {
  @Field()
  id: string;

  constructor(payload: OneVsOneBetGraphQLOrphanEntity) {
    this.id = payload.id;
  }

  public static createReference(id: string): OneVsOneBetGraphQLEntityReference {
    return {
      id,
      __typename: GraphQLEntitiesNames.OneVsOneBet,
    }
  }
}
