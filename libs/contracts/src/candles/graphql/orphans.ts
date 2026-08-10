import { Directive, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLEntitiesNames } from '@xyro/core';

import { CandleGraphQLEntityReference } from './references';

@ObjectType(GraphQLEntitiesNames.Candle)
@Directive('@key(fields: "openTime")')
export class CandleGraphQLOrphanEntity {
  @Field(() => Date)
  openTime: Date;

  constructor(payload: CandleGraphQLOrphanEntity) {
    this.openTime = payload.openTime;
  }

  public static createReference(openTime: Date): CandleGraphQLEntityReference {
    return {
      openTime,
      __typename: GraphQLEntitiesNames.Candle,
    };
  }
}
