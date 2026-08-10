import { GraphQLEntitiesNames } from '@xyro/core';

export interface UpDownGameGraphQLEntityReference {
  id: string;
  __typename: GraphQLEntitiesNames.UpDownGame;
}

export interface UpDownBetGraphQLEntityReference {
  id: string;
  __typename: GraphQLEntitiesNames.UpDownBet;
}
