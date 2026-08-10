import { GraphQLEntitiesNames } from '@xyro/core';

export interface CandleGraphQLEntityReference {
  openTime: Date;
  __typename: GraphQLEntitiesNames.Candle;
}
