import { GraphQLEntitiesNames } from '@xyro/core';

export interface MessageGraphQLEntityReference {
  id: string;
  __typename: GraphQLEntitiesNames.Message;
}
