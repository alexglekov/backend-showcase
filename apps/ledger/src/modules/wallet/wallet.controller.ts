import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Balance, GetUserBalancePayload } from '@xyro/contracts/ledger';
import { LoggerService } from '@xyro/libs/logger';

import { WalletsService } from './wallet.service';

@Controller()
export class WalletsController {
  constructor(
    private readonly logger: LoggerService,
    private readonly walletService: WalletsService,
  ) {
    this.logger.setContext(WalletsController.name);
  }

  @GrpcMethod('LedgerService', 'GetUserBalance')
  async getUserBalance(
    data: GetUserBalancePayload
  ): Promise<Balance> {
    const currentBalance = await this.walletService.getUserBalance({ userId: data.userId });

    return {
      accountId: currentBalance.accountId,
      amount: Number(currentBalance.amount),
      id: currentBalance.id!
    }
  }
}
