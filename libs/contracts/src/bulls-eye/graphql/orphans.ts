import { Directive, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLEntitiesNames } from '@xyro/core';

import {
  BullsEyeBetGraphQLEntityReference,
  BullsEyeGameGraphQLEntityReference
} from './references';

@ObjectType(GraphQLEntitiesNames.BullsEyeGame)
@Directive('@key(fields: "id")')
export class BullsEyeGameGraphQLOrphanEntity {
  @Field()
  id: string;

  constructor(payload: BullsEyeGameGraphQLOrphanEntity) {
    this.id = payload.id;
  }

  public static createReference(id: string): BullsEyeGameGraphQLEntityReference {
    return {
      id,
      __typename: GraphQLEntitiesNames.BullsEyeGame,
    }
  }
}

@ObjectType(GraphQLEntitiesNames.BullsEyeBet)
@Directive('@key(fields: "id")')
export class BullsEyeBetGraphQLOrphanEntity {
  @Field()
  id: string;

  constructor(payload: BullsEyeBetGraphQLOrphanEntity) {
    this.id = payload.id;
  }

  public static createReference(id: string): BullsEyeBetGraphQLEntityReference {
    return {
      id,
      __typename: GraphQLEntitiesNames.BullsEyeBet,
    }
  }
}
