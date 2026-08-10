import { BadRequestException, Injectable } from '@nestjs/common';

import { AccountService } from '../internal-services/account.service';
import { resolveAccountName } from '../core/accountNames.util';
import { AccountNames, LiabilitiesAccounts } from '../core/enums';

@Injectable()
export class AccountsLedgerService {
  constructor(
    private readonly accountService: AccountService,
  ) {}

  public async getAccountById(accountId: string) {
    const account = await this.accountService.findAccountById(accountId);

    if (!account) {
      throw new BadRequestException(`Ledger Account not found with ID ${accountId}`)
    }

    return account;
  }

  public async getUserAccount(userId: string) {
    const account = await this.accountService.findOrCreateAccount(
      resolveAccountName([
        AccountNames.Liabilities,
        LiabilitiesAccounts.userBalance,
        userId,
      ]),
    );

    if (!account) {
      throw new BadRequestException(`Ledger Account not found with User ID ${userId}`)
    }

    return account;
  }
}
