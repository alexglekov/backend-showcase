import { ObjectType, Field, Directive } from '@nestjs/graphql';
import { PaymentOrder, PaymentTransaction } from '@prisma/client';
import { PaymentOrderEntity } from '@xyro/contracts/users';
import { GraphQLEntitiesNames } from '@xyro/core';

import { PaymentTransactionGraphQLEntity } from './paymentGraphql.types';

@ObjectType(GraphQLEntitiesNames.PaymentOrder)
@Directive('@key(fields: "id")')
export class PaymentOrderGraphQLEntity extends PaymentOrderEntity {
  @Field(() => PaymentTransactionGraphQLEntity)
  transaction: PaymentTransactionGraphQLEntity;

  constructor(order: PaymentOrder & { transaction: PaymentTransaction }) {
    super(order);

    const { transaction } = order;

    this.transaction = new PaymentTransactionGraphQLEntity({ ...transaction, order });
  }
}
