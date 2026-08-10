import { Directive, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLEntitiesNames } from '@xyro/core';

import {
  UpDownBetGraphQLEntityReference,
  UpDownGameGraphQLEntityReference
} from './references';

@ObjectType(GraphQLEntitiesNames.UpDownGame)
@Directive('@key(fields: "id")')
export class UpDownGameGraphQLOrphanEntity {
  @Field()
  id: string;

  constructor(payload: UpDownGameGraphQLOrphanEntity) {
    this.id = payload.id;
  }

  public static createReference(id: string): UpDownGameGraphQLEntityReference {
    return {
      id,
      __typename: GraphQLEntitiesNames.UpDownGame,
    }
  }
}

@ObjectType(GraphQLEntitiesNames.UpDownBet)
@Directive('@key(fields: "id")')
export class UpDownBetGraphQLOrphanEntity {
  @Field()
  id: string;

  constructor(payload: UpDownBetGraphQLOrphanEntity) {
    this.id = payload.id;
  }

  public static createReference(id: string): UpDownBetGraphQLEntityReference {
    return {
      id,
      __typename: GraphQLEntitiesNames.UpDownBet,
    }
  }
}
