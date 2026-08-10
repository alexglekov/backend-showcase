import { Injectable } from '@nestjs/common';

import { AccountService } from '../internal-services/account.service';
import { resolveAccountName } from '../core/accountNames.util';
import { AccountNames } from '../core/enums';
import { EntryService } from '../internal-services/entry.service';
import { AccountNotFoundError } from '../errors';

type PeriodParams = {
  from: Date;
  to: Date;
};

@Injectable()
export class AnalyticsLedgerService {
  constructor(
    private readonly accountService: AccountService,
    private readonly entriesService: EntryService
  ) {}

  public async getIncomeSumForPeriod(period: PeriodParams) {
    const accountName = AccountNames.Income;

    const account = await this.accountService.findOrCreateAccount(accountName);

    if (!account) {
      throw new AccountNotFoundError(accountName);
    }

    return this.entriesService.findEntriesByAccountIdForPeriod(
      account.id!,
      period.from,
      period.to
    );
  }
}
