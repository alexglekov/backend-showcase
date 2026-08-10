import { GraphQLEntitiesNames } from '@xyro/core';

export interface BetGraphQLEntityReference {
  id: string;
  __typename: GraphQLEntitiesNames.Bet;
}

export interface SeasonGraphQLEntityReference {
  id: string;
  __typename: GraphQLEntitiesNames.Season;
}

export interface RewardGraphQLEntityReference {
  id: string;
  __typename: GraphQLEntitiesNames.Reward;
}
