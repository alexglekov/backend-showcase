import { Injectable } from '@nestjs/common';
import { PaymentStatus, PaymentType } from '@prisma/client';
import { WalletLedgerService } from '@xyro/libs/ledger';

import { PrismaService } from '../../infrastructure/prisma';

interface GetUserOperationsHistoryParams {
  userId: string;
  take: number;
  skip: number;
}

interface GetUserWalletStatisticParams {
  userId: string;
}

@Injectable()
export class WalletsService {
  constructor(
    private readonly walletLedgerService: WalletLedgerService,
    private readonly prismaService: PrismaService
  ) {}

  public async getUserOperationsHistory(
    params: GetUserOperationsHistoryParams
  ) {
    const entries = await this.walletLedgerService.getUserBalanceOperations(
      params
    );
    const countEntries =
      await this.walletLedgerService.getCountUserBalanceOperations(params);

    return {
      entries,
      take: params.take,
      skip: params.skip,
      total: countEntries,
    };
  }

  public async getUserWalletStatistic(params: GetUserWalletStatisticParams) {
    const { userId } = params;

    const currentBalance = await this.walletLedgerService.getCurrentUserBalance(
      { userId }
    );
    const payments = await this.prismaService.paymentTransaction.findMany({
      where: {
        status: PaymentStatus.CONFIRMED,
        order: {
          ownerId: userId,
        },
      },
    });

    let countWithdrawTransactions = 0;
    let amountWithdraw = 0;
    let countDepositTransactions = 0;
    let amountDeposit = 0;

    payments.forEach((payment) => {
      if (payment.type === PaymentType.DEPOSIT) {
        amountDeposit += Number(payment.amount);
        countDepositTransactions += 1;
      } else {
        amountWithdraw += Number(payment.originalAmount);
        countWithdrawTransactions += 1;
      }
    });

    return {
      currentBalance: Number(currentBalance.amount),
      deposits: {
        amount: amountDeposit,
        count: countDepositTransactions,
      },
      withdraws: {
        amount: amountWithdraw,
        count: countWithdrawTransactions,
      },
    };
  }
}
