import { Field, ObjectType } from '@nestjs/graphql';
import { PaginatedGraphQLOutput } from '@xyro/libs/graphql';
import { PaymentOrder, PaymentTransaction, User } from '@prisma/client';

import { UserGraphQLEntity } from '../../../users';

@ObjectType('Transaction')
export class PaymentTransactionGraphQLEntity {
  @Field()
  id: string;

  @Field()
  foreignId: string;

  @Field()
  paymentSystem: string;

  @Field({ nullable: true })
  transactionHash?: string;

  @Field({ nullable: true })
  confirmations?: number;

  @Field()
  status: string;

  @Field()
  type: string;

  @Field({ nullable: true })
  error?: string;

  @Field()
  currency: string;

  @Field({ nullable: true })
  amount?: number;

  @Field({ nullable: true })
  originalAmount?: number;

  @Field()
  address: string;

  @Field({ nullable: true })
  platformFee?: number;

  @Field({ nullable: true })
  networkFee?: number;

  @Field(() => Date)
  createdAt: Date;

  constructor(entity: PaymentTransaction) {
    this.id = entity.id;
    this.foreignId = entity.foreignId;
    this.paymentSystem = entity.paymentSystem;
    this.transactionHash = entity.transactionHash || undefined;
    this.confirmations = entity.confirmations || undefined;
    this.status = entity.status;
    this.type = entity.type;
    this.error = entity.error || undefined;
    this.currency = entity.currency;
    this.amount = entity.amount ? Number(entity.amount) : undefined;
    this.originalAmount = entity.originalAmount ? Number(entity.originalAmount) : undefined;
    this.address = entity.address;
    this.platformFee = entity.platformFee ? Number(entity.platformFee) : undefined;
    this.networkFee = entity.networkFee ? Number(entity.networkFee) : undefined;
    this.createdAt = entity.createdAt;
  }
}

@ObjectType('Order')
export class OrderGraphQLEntity {
  @Field()
  id: string;

  @Field()
  transactionId: string;

  @Field(() => UserGraphQLEntity)
  owner: UserGraphQLEntity;

  @Field(() => PaymentTransactionGraphQLEntity)
  transaction: PaymentTransactionGraphQLEntity;

  @Field()
  type: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  cancelReason?: string;

  constructor(entity: PaymentOrder & { transaction: PaymentTransaction; owner: User }) {
    this.id = entity.id;
    this.transactionId = entity.transactionId;
    this.type = entity.type;
    this.status = entity.status;
    this.cancelReason = entity.cancelReason || undefined;

    this.transaction = new PaymentTransactionGraphQLEntity(entity.transaction);
    this.owner = new UserGraphQLEntity(entity.owner);
  }
}

@ObjectType('OrderState')
export class OrderStateGraphQLEntity {
  @Field()
  id: string;

  @Field()
  status: string;

  constructor(entity: PaymentOrder & { transaction: PaymentTransaction; owner: User }) {
    this.id = entity.id;
    this.status = entity.status;
  }
}

@ObjectType('OrdersPaginated')
export class OrdersPaginatedGraphqlEntity extends PaginatedGraphQLOutput {
  @Field(() => [OrderGraphQLEntity])
  orders: OrderGraphQLEntity[]

  constructor(entities: (PaymentOrder & { transaction: PaymentTransaction; owner: User })[], total: number, skip: number, take: number) {
    super();

    this.total = total;
    this.take = take;
    this.skip = skip;
    this.orders = entities.map((entity) => new OrderGraphQLEntity(entity));
  }
}