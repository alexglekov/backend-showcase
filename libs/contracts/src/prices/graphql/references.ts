import { GraphQLEntitiesNames } from '@xyro/core';

export interface AssetPriceGraphQLEntityReference {
  id: string;
  __typename: GraphQLEntitiesNames.AssetPrice;
}

export interface AssetGraphQLEntityReference {
  id: string;
  __typename: GraphQLEntitiesNames.Asset;
}
