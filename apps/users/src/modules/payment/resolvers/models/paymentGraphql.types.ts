import { Directive, Field, InputType, ObjectType } from '@nestjs/graphql';
import { PaymentOrder, PaymentTransaction } from '@prisma/client';
import { PaymentTransactionEntity } from '@xyro/contracts/users';
import { GraphQLEntitiesNames } from '@xyro/core';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { PaymentOrderGraphQLEntity } from './paymentOrderGraphQLEntity';

@ObjectType()
export class PaymentOperation {
  @Field()
  minAmount: number;

  @Field()
  feePercent: number;

  @Field()
  exchangeFee: number;

  @Field()
  platformFee: number;
}

@ObjectType()
export class Currency {
  @Field()
  currency: string;

  @Field({ nullable: true })
  rateTo?: number;

  @Field({ nullable: true })
  rateFrom?: number;

  @Field(() => PaymentOperation, { nullable: true })
  withdrawOperation?: PaymentOperation;

  @Field(() => PaymentOperation, { nullable: true })
  depositOperation?: PaymentOperation;
}

@InputType()
export class DepositOperationInput {
  @Field(() => String)
  @IsNotEmpty()
  currency: string;
}

@InputType()
export class WithdrawOperationInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  address: string;
  
  @Field()
  @IsString()
  @IsNotEmpty()
  currency: string;
  
  @Field()
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}

@ObjectType(GraphQLEntitiesNames.PaymentTransaction)
@Directive('@key(fields: "id")')
export class PaymentTransactionGraphQLEntity extends PaymentTransactionEntity {
  @Field(() => PaymentOrderGraphQLEntity)
  order: PaymentOrderGraphQLEntity;

  constructor(transaction: PaymentTransaction & { order: PaymentOrder }) {
    super(transaction);

    const { order } = transaction;

    this.order = new PaymentOrderGraphQLEntity({ ...order, transaction });
  }
}
