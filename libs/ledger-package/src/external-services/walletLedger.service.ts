import { Injectable } from '@nestjs/common';

import { AccountService } from '../internal-services/account.service';
import { resolveAccountName } from '../core/accountNames.util';
import {
  AccountNames,
  LiabilitiesAccounts,
} from '../core/enums';
import { BalanceService } from '../internal-services/balance.service';
import { EntryService } from '../internal-services/entry.service';
import { EntryType, GameTypeEnum } from '@prisma/client';
import Decimal from 'decimal.js';
import { DBTransaction } from '../internal-services/prisma.service';
import { LedgerJournalEntity } from '../entities/journal.entity';

interface GetCurrentUserBalanceParams {
  userId: string;
}

interface GetUserBalanceOperationsParams {
  userId: string;
  type?: EntryType;
  gameMode?: GameTypeEnum;
  take: number;
  skip: number;
}

interface GetUserBalanceHistoryParams {
  userId: string;
  startDate?: Date;
  endDate?: Date;
}

interface GetCountUserBalanceOperationsParams {
  userId: string;
  type?: EntryType;
  gameMode?: GameTypeEnum;
}

@Injectable()
export class WalletLedgerService {
  constructor(
    private readonly accountService: AccountService,
    private readonly balanceService: BalanceService,
    private readonly entriesService: EntryService,
  ) {}

  public async getCurrentUserBalance(params: GetCurrentUserBalanceParams) {
    const userAccountName = resolveAccountName([
      AccountNames.Liabilities,
      LiabilitiesAccounts.userBalance,
      params.userId,
    ]);

    const userAccount = await this.accountService.findOrCreateAccount(userAccountName);

    return this.balanceService.findBalanceByAccountId(userAccount.id!);
  }

  public async updateBalanceByAccountAndJournal(accountId: string, amount: Decimal, journal?: LedgerJournalEntity, dbTransaction?: DBTransaction) {
    return this.balanceService.updateBalanceByAccountId(accountId, amount, journal, dbTransaction);
  }

  public async getUserBalanceByAccountId(accountId: string) {
    return this.balanceService.findBalanceByAccountId(accountId);
  }

  public async getUserBalanceOperations(params: GetUserBalanceOperationsParams) {
    const userAccountName = resolveAccountName([
      AccountNames.Liabilities,
      LiabilitiesAccounts.userBalance,
      params.userId,
    ]);

    const userAccount = await this.accountService.findOrCreateAccount(userAccountName);

    return this.entriesService.findEntriesBy(
      {
        accountId: userAccount.id!,
        take: params.take,
        skip: params.skip,
        gameMode: params.gameMode,
        type: params.type,
      },
      undefined
    );
  }

  public async getCountUserBalanceOperations(params: GetCountUserBalanceOperationsParams) {
    const userAccountName = resolveAccountName([
      AccountNames.Liabilities,
      LiabilitiesAccounts.userBalance,
      params.userId,
    ]);

    const userAccount = await this.accountService.findOrCreateAccount(userAccountName);

    return this.entriesService.countEntriesBy(
      {
        accountId: userAccount.id!,
        gameMode: params.gameMode,
        type: params.type,
      },
      undefined
    );
  }

  public async getUserBalanceHistory(params: GetUserBalanceHistoryParams) {
    const userAccountName = resolveAccountName([
      AccountNames.Liabilities,
      LiabilitiesAccounts.userBalance,
      params.userId,
    ]);

    const userAccount = await this.accountService.findOrCreateAccount(userAccountName);

    return this.balanceService.findFilteredBalancesByAccountId({
      accountId: userAccount.id!,
      endDate: params.endDate,
      startDate: params.startDate,
    });
  }
}
