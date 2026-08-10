import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import {
  GetLedgerAccountByIdPayload,
  GetUserLedgerAccountPayload,
  LedgerAccount,
} from '@xyro/contracts/ledger';
import { AccountsLedgerService } from '@xyro/libs/ledger';

@Controller()
export class AccountsController {
  constructor(
    private readonly ledgerService: AccountsLedgerService
  ) {}

  @GrpcMethod('LedgerService', 'GetLedgerAccountById')
  async getLedgerAccountById(
    data: GetLedgerAccountByIdPayload
  ): Promise<LedgerAccount> {
    try {
      const account = await this.ledgerService.getAccountById(data.accountId);

      return {
        fullName: account.fullName,
        id: account.id!,
        name: account.accountName,
        parentId: account.parentId || undefined,
      };
    } catch (e) {
      throw new RpcException(e);
    }
  }

  @GrpcMethod('LedgerService', 'GetUserLedgerAccount')
  async getUserLedgerAccount(
    data: GetUserLedgerAccountPayload
  ): Promise<LedgerAccount> {
    try {
      const account = await this.ledgerService.getUserAccount(data.userId);

      return {
        fullName: account.fullName,
        id: account.id!,
        name: account.accountName,
        parentId: account.parentId || undefined,
      };
    } catch (e) {
      throw new RpcException(e);
    }
  }
}
