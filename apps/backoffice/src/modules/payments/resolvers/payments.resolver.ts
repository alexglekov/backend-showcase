import { Resolver, Query, Args, Mutation, Subscription } from '@nestjs/graphql';
import { IUserCredentials, PaginatedGraphQLInput, UserCredentials } from '@xyro/libs/graphql';

import { PaymentsService } from '../payments.service';
import { OrderGraphQLEntity, OrderStateGraphQLEntity, OrdersPaginatedGraphqlEntity } from './models/paymentGraphql.models';
import { AcceptWithdrawOrder, RejectWithdrawOrder } from './models/paymentInputs.models';
import { PubSubService } from '../../../infrastructure/pub-sub';

import { PermissionsEnum, UsePermissions } from '../../iam/permissions';

@Resolver()
export class PaymentsResolver {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly pubSubService: PubSubService
  ) {}

  @Query(() => OrdersPaginatedGraphqlEntity)
  @UsePermissions([
    PermissionsEnum.ordersRead,
  ])
  async getOpenWithdrawOrders(
    @UserCredentials() _credentials: IUserCredentials,
    @Args('input') input: PaginatedGraphQLInput,
  ): Promise<OrdersPaginatedGraphqlEntity> {
    const { orders, skip, take, total } = await this.paymentsService.getOpenWithdrawOrders(input);

    return new OrdersPaginatedGraphqlEntity(orders, total, skip, take);
  }

  @Query(() => OrderGraphQLEntity)
  async getOrderById(
    @UserCredentials() _credentials: IUserCredentials,
    @Args('id') orderId: string,
  ): Promise<OrderGraphQLEntity> {
    const order = await this.paymentsService.getOrderById(orderId);

    return new OrderGraphQLEntity(order);
  }


  @Mutation(() => OrderGraphQLEntity)
  @UsePermissions([
    PermissionsEnum.ordersWithdrawAccept,
  ])
  async acceptWithdraw(
    @UserCredentials() credentials: IUserCredentials,
    @Args('input') input: AcceptWithdrawOrder,
  ): Promise<OrderGraphQLEntity> {
    const { userId } = credentials;
    const order = await this.paymentsService.acceptWithdrawOrder({
      blameId: userId,
      orderId: input.orderId,
    });

    return new OrderGraphQLEntity(order);
  }

  @Mutation(() => OrderGraphQLEntity)
  @UsePermissions([
    PermissionsEnum.ordersWithdrawReject,
  ])
  async rejectWithdraw(
    @UserCredentials() credentials: IUserCredentials,
    @Args('input') input: RejectWithdrawOrder,
  ): Promise<OrderGraphQLEntity> {
    const { userId } = credentials;
    const order = await this.paymentsService.rejectWithdrawOrder({
      blameId: userId,
      orderId: input.orderId,
      cancelReason: input.cancelReason
    });

    return new OrderGraphQLEntity(order);
  }

  @Subscription(() => OrderStateGraphQLEntity)
  @UsePermissions([
    PermissionsEnum.ordersStateRead,
  ])
  async orderChanged(
    @UserCredentials() _credentials: IUserCredentials,
  ) {
    return this.pubSubService.orderChanged();
  }
}