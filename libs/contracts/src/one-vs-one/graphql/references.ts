import { GraphQLEntitiesNames } from '@xyro/core';

export interface OneVsOneGameGraphQLEntityReference {
  id: string;
  __typename: GraphQLEntitiesNames.OneVsOneGame;
}

export interface OneVsOneBetGraphQLEntityReference {
  id: string;
  __typename: GraphQLEntitiesNames.OneVsOneBet;
}
