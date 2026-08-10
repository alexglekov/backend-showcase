import Decimal from 'decimal.js';
import { Injectable } from '@nestjs/common';
import { PrismaTransaction } from '@xyro/libs/utils';
import { EntryType } from '@prisma/client';

import { BalanceService } from '../internal-services/balance.service';
import { AccountService } from '../internal-services/account.service';
import { AccountNames, LiabilitiesAccounts, OutcomeAccounts } from '../core/enums';
import { JournalService } from '../internal-services/journal.service';
import { resolveAccountName } from '../core/accountNames.util';
import { LedgerJournalEntity } from '../entities/journal.entity';
import { LedgerEntryEntity } from '../entities/entry.entity';

interface AddRewardToUserBalanceParams {
  reward: Decimal;
  userId: string;
  reason: string;
}

@Injectable()
export class RewardsLedgerService {
  constructor(
    private readonly accountService: AccountService,
    private readonly balanceService: BalanceService,
    private readonly journalService: JournalService,
  ) {}

  public async addRewardToUserBalance(
    params: AddRewardToUserBalanceParams,
    dbTransaction: PrismaTransaction,
  ) {
    const { userId, reward, reason } = params;

    const userAccount = await this.accountService.findOrCreateAccount(
      resolveAccountName([
        AccountNames.Liabilities,
        LiabilitiesAccounts.userBalance,
        userId,
      ]),
      dbTransaction,
    );

    const bonusAccount = await this.accountService.findOrCreateAccount(
      resolveAccountName([AccountNames.Outcome, OutcomeAccounts.bonus]),
      dbTransaction
    );

    const balance = await this.balanceService.findBalanceByAccountId(
      userAccount.id!,
      dbTransaction,
    );

    const journal = new LedgerJournalEntity({
      entries: [],
      name: reason,
    });

    journal.addEntry(
      new LedgerEntryEntity({
        accountId: bonusAccount.id!,
        amount: reward,
        isCredit: false,
        account: bonusAccount,
        type: EntryType.bonus,
        meta: {
          type: EntryType.bonus,
          amount: Number(reward),
          reason,
        },
      }),
    );

    journal.addEntry(
      new LedgerEntryEntity({
        accountId: userAccount.id!,
        account: userAccount,
        amount: reward,
        isRead: true,
        isCredit: true,
        type: EntryType.bonus,
        meta: {
          type: EntryType.bonus,
          amount: Number(reward),
          reason,
        },
      }),
    );

    const createdJournal = await this.journalService.save(journal, dbTransaction);

    balance.add(reward);
    await this.balanceService.updateBalance(balance, createdJournal, dbTransaction);

    return balance;
  }
}
