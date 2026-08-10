import { Inject, Injectable } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { AppsNames } from '@xyro/core';
import { UsersService } from '@xyro/contracts/users';
import { lastValueFrom } from 'rxjs';

import { PrismaService } from '../../infrastructure/prisma';
import { PubSubService } from '../../infrastructure/pub-sub';

type GetOpenWithdrawOrdersParams = {
  skip: number;
  take: number;
}

type AcceptWithdrawOrder = {
  blameId: string;
  orderId: string;
}

type RejectWithdrawOrder = {
  blameId: string;
  orderId: string;
  cancelReason: string;
}

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(AppsNames.Users) private readonly usersService: UsersService,
    private readonly prismaService: PrismaService,
    private readonly pubSubService: PubSubService
  ) {}

  public async getOrderById(id: string) {
    return this.prismaService.paymentOrder.findFirstOrThrow({
      where: {
        id,
      },
      include: {
        transaction: true,
        owner: true,
      }
    })
  }

  public async getOpenWithdrawOrders(params: GetOpenWithdrawOrdersParams) {
    const [orders, ordersAmount] = await Promise.all([
      this.prismaService.paymentOrder.findMany({
        where: {
          status: {
            in: [PaymentStatus.PENDING],
          }
        },
        include: {
          owner: true,
          transaction: true,
        },
        skip: params.skip,
        take: params.take,
      }),
      this.prismaService.paymentOrder.count({
        where: {
          status: {
            in: [PaymentStatus.PENDING],
          }
        },
      })
    ]);

    return {
      orders,
      take: params.take,
      skip: params.skip,
      total: ordersAmount,
    };
  }

  public async acceptWithdrawOrder(params: AcceptWithdrawOrder) {
    const { blameId, orderId } = params;

    await lastValueFrom(this.usersService.acceptWithdrawOrder({ blameId, orderId }));

    const paymentOrder = await this.prismaService.paymentOrder.findFirstOrThrow({
      where: {
        id: orderId
      },
      include: {
        owner: true,
        transaction: true
      }
    });

    try {
      await this.pubSubService.publishNewOrderState({
        orderChanged: {
          id: paymentOrder.id,
          status: paymentOrder.status
        }
      });
    } catch {}

    return paymentOrder;
  }

  public async rejectWithdrawOrder(params: RejectWithdrawOrder) {
    const { blameId, orderId, cancelReason } = params;

    await lastValueFrom(this.usersService.rejectWithdrawOrder({ blameId, orderId, cancelReason }));

    const paymentOrder = await this.prismaService.paymentOrder.findFirstOrThrow({
      where: {
        id: orderId
      },
      include: {
        owner: true,
        transaction: true
      }
    });
 
    try {
      await this.pubSubService.publishNewOrderState({
        orderChanged: {
          id: paymentOrder.id,
          status: paymentOrder.status
        }
      });
    } catch {}

    return paymentOrder;
  }
}