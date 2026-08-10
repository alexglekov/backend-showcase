import { GraphQLEntitiesNames } from '@xyro/core';

export interface PaymentTransactionGraphQLEntityReference {
  id: string;
  __typename: GraphQLEntitiesNames.PaymentTransaction;
}

export interface PaymentOrderGraphQLEntityReference {
  id: string;
  __typename: GraphQLEntitiesNames.PaymentOrder;
}
