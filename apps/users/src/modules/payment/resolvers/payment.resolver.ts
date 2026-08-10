import 'reflect-metadata';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';

import { PaymentService } from '../services/payment.service';
import {
  Currency,
  DepositOperationInput,
  PaymentTransactionGraphQLEntity,
  WithdrawOperationInput
} from './models/paymentGraphql.types';
import { PaymentOrderGraphQLEntity } from './models/paymentOrderGraphQLEntity';

@Resolver()
export class PaymentResolver {
  constructor(
    private paymentService: PaymentService,
    // private readonly pubSubService: PubSubService,
    // private readonly paymentLedgerService: PaymentLedgerService,
    // private readonly prismaService: PrismaService,
  ) {}

  @Query(() => [Currency])
  async getPaymentCurrencies(
    @UserCredentials() _credentials: IUserCredentials,
  ): Promise<Currency[]> {
    return this.paymentService.getPaymentCurrencies();
  }

  @Mutation(() => PaymentTransactionGraphQLEntity)
  public async withdraw(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') input: WithdrawOperationInput,
  ) {
    const { userId } = credentials;

    const transaction = await this.paymentService.withdraw({
      userId,
      ...input
    });

    return new PaymentTransactionGraphQLEntity(transaction);
  }

  @Mutation(() => PaymentTransactionGraphQLEntity)
  public async deposit(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') data: DepositOperationInput,
  ) {
    const { userId } = credentials;

    const transaction = await this.paymentService.deposit({
      userId,
      ...data,
    });

    return new PaymentTransactionGraphQLEntity(transaction);
  }

  @Query(() => [PaymentTransactionGraphQLEntity])
  async getPaymentTransactions(
    @UserCredentials() credentials: IUserCredentials,
  ): Promise<PaymentTransactionGraphQLEntity[]> {
    const { userId } = credentials;

    const transactions = await this.paymentService.getPaymentTransactions({ userId });

    return transactions.map((transaction) => new PaymentTransactionGraphQLEntity({ ...transaction, order: transaction.order! }));
  }

  @Query(() => PaymentOrderGraphQLEntity)
  async getPaymentOrder(@Args('id') paymentOrderId: string): Promise<PaymentOrderGraphQLEntity> {

    const paymentOrder = await this.paymentService.getPaymentOrderById(paymentOrderId);

    return new PaymentOrderGraphQLEntity(paymentOrder);
  }
}
