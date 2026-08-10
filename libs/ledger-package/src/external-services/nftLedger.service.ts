import Decimal from 'decimal.js';
import { Injectable } from '@nestjs/common';
import { PrismaTransaction } from '@xyro/libs/utils';
import { EntryType } from '@prisma/client';

import { BalanceService } from '../internal-services/balance.service';
import { AccountService } from '../internal-services/account.service';
import {
  AccountNames,
  LiabilitiesAccounts,
  OutcomeAccounts,
} from '../core/enums';
import { JournalService } from '../internal-services/journal.service';
import { resolveAccountName } from '../core/accountNames.util';
import { LedgerJournalEntity } from '../entities/journal.entity';
import { LedgerEntryEntity } from '../entities/entry.entity';

interface AddNftToUserBalanceParams {
  value: Decimal;
  userId: string;
  reason: string;
}

@Injectable()
export class NftLedgerService {
  constructor(
    private readonly accountService: AccountService,
    private readonly balanceService: BalanceService,
    private readonly journalService: JournalService
  ) {}

  public addNftBalance(
    params: AddNftToUserBalanceParams,
    dbTransaction: PrismaTransaction
  ) {
    return this.changeNftBalance(params, dbTransaction, true);
  }

  public removeNftBalance(
    params: AddNftToUserBalanceParams,
    dbTransaction: PrismaTransaction
  ) {
    return this.changeNftBalance(params, dbTransaction, false);
  }

  private async changeNftBalance(
    params: AddNftToUserBalanceParams,
    dbTransaction: PrismaTransaction,
    isAdd: boolean
  ) {
    const { userId, value, reason } = params;

    const userAccount = await this.accountService.findOrCreateAccount(
      resolveAccountName([
        AccountNames.Liabilities,
        LiabilitiesAccounts.userBalance,
        userId,
      ]),
      dbTransaction
    );

    const bonusAccount = await this.accountService.findOrCreateAccount(
      resolveAccountName([AccountNames.Outcome, OutcomeAccounts.bonus]),
      dbTransaction
    );

    const balance = await this.balanceService.findBalanceByAccountId(
      userAccount.id!,
      dbTransaction
    );

    const journal = new LedgerJournalEntity({
      entries: [],
      name: reason,
    });

    journal.addEntry(
      new LedgerEntryEntity({
        accountId: bonusAccount.id!,
        amount: value,
        isCredit: !isAdd,
        account: bonusAccount,
        type: isAdd ? EntryType.bonus : EntryType.bonusRemoved,
        meta: {
          type: isAdd ? EntryType.bonus : EntryType.bonusRemoved,
          amount: Number(value),
          reason,
        },
      })
    );

    journal.addEntry(
      new LedgerEntryEntity({
        accountId: userAccount.id!,
        amount: value,
        account: userAccount,
        isRead: true,
        isCredit: isAdd,
        type: isAdd ? EntryType.bonus : EntryType.bonusRemoved,
        meta: {
          type: isAdd ? EntryType.bonus : EntryType.bonusRemoved,
          amount: Number(value),
          reason,
        },
      })
    );

    const createdJournal = await this.journalService.save(
      journal,
      dbTransaction
    );

    if (isAdd) {
      balance.add(value);
    } else {
      balance.sub(value);
    }

    await this.balanceService.updateBalance(
      balance,
      createdJournal,
      dbTransaction
    );

    return balance;
  }
}
