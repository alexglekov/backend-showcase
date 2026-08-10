import { Directive, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLEntitiesNames } from '@xyro/core';

import { BalanceGraphQLEntityReference } from './references';

@ObjectType(GraphQLEntitiesNames.Balance)
@Directive('@key(fields: "id")')
export class BalanceGraphQLOrphanEntity {
  @Field()
  id: string;

  constructor(payload: BalanceGraphQLOrphanEntity) {
    this.id = payload.id;
  }

  public static createReference(id: string): BalanceGraphQLEntityReference {
    return {
      id,
      __typename: GraphQLEntitiesNames.Balance,
    }
  }
}
