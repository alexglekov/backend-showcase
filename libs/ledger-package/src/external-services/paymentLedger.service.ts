import { Decimal } from 'decimal.js';
import { Injectable } from '@nestjs/common';
import { PrismaTransaction } from '@xyro/libs/utils';
import { EntryType, PaymentOrder, PaymentTransaction } from '@prisma/client';

import { JournalService } from '../internal-services/journal.service';
import { AccountService } from '../internal-services/account.service';
import { LedgerJournalEntity } from '../entities/journal.entity';
import { resolveAccountName } from '../core/accountNames.util';
import {
  AccountNames,
  AssetsAccounts,
  FeesAccounts,
  IncomeAccounts,
  LiabilitiesAccounts,
  UserBalanceAccouns,
  OutcomeAccounts,
  NetworkFeeAccounts,
} from '../core/enums';
import { LedgerEntryEntity } from '../entities/entry.entity';
import { BalanceService } from '../internal-services/balance.service';
import { NotEnoughBalanceForThisOperationError } from '../errors';
import { LedgerBalanceEntity } from '../entities/balance.entity';

@Injectable()
export class PaymentLedgerService {
  constructor(
    private readonly journalService: JournalService,
    private readonly accountService: AccountService,
    private readonly balanceService: BalanceService,
  ) {}

  public async deposit(
    order: PaymentOrder,
    transaction: PaymentTransaction,
    dbTransaction: PrismaTransaction,
  ): Promise<LedgerBalanceEntity> {
    const { ownerId } = order;
    const { amount, originalAmount, platformFee, currency } = transaction;

    const usdAssetAccount = await this.accountService.findOrCreateAccount(
      resolveAccountName([AccountNames.Assets, AssetsAccounts.usd]),
    );

    const userAccount = await this.accountService.findOrCreateAccount(
      resolveAccountName([
        AccountNames.Liabilities,
        LiabilitiesAccounts.userBalance,
        ownerId,
      ]),
    );

    const balance = await this.balanceService.findBalanceByAccountId(
      userAccount.id!,
      dbTransaction,
    );

    const feeAccount = await this.accountService.findOrCreateAccount(
      resolveAccountName([
        AccountNames.Income,
        IncomeAccounts.fee,
        FeesAccounts.deposit,
      ]),
      dbTransaction,
    );

    const journal = new LedgerJournalEntity({
      entries: [],
      name: `User deposited ${amount!.toNumber()} ${AssetsAccounts.usd}`,
    });

    journal.addEntry(
      new LedgerEntryEntity({
        accountId: usdAssetAccount.id!,
        amount: amount!.add(platformFee!),
        account: usdAssetAccount,
        isCredit: false,
        type: EntryType.userDeposit,
        meta: {
          type: EntryType.userDeposit,
          amount: Number(originalAmount),
          currency: currency,
          orderId: order.id,
        },
      }),
    );

    journal.addEntry(
      new LedgerEntryEntity({
        accountId: userAccount.id!,
        amount: amount!,
        isRead: true,
        account: userAccount,
        isCredit: true,
        type: EntryType.userDeposit,
        meta: {
          type: EntryType.userDeposit,
          amount: Number(originalAmount),
          currency: currency,
          orderId: order.id,
        },
      }),
    );

    journal.addEntry(
      new LedgerEntryEntity({
        accountId: feeAccount.id!,
        amount: platformFee!,
        account: feeAccount,
        isCredit: true,
        type: EntryType.userDeposit,
        meta: {
          type: EntryType.userDeposit,
          amount: Number(originalAmount),
          currency: currency,
          orderId: order.id,
        },
      }),
    );

    const createdJournal = await this.journalService.save(journal, dbTransaction);

    balance.add(amount!);
    await this.balanceService.updateBalance(balance, createdJournal, dbTransaction);

    return balance;
  }

  public async hold(
    order: PaymentOrder,
    transaction: PaymentTransaction,
    dbTransaction: PrismaTransaction,
  ): Promise<LedgerBalanceEntity> {
    const { ownerId } = order;
    const { originalAmount, networkFee } = transaction;

    const totalAmount = new Decimal(originalAmount!).add(networkFee!);

    const userAccount = await this.accountService.findOrCreateAccount(
      resolveAccountName([
        AccountNames.Liabilities,
        LiabilitiesAccounts.userBalance,
        ownerId,
      ]),
    );

    const balance = await this.balanceService.findBalanceByAccountId(
      userAccount.id!,
      dbTransaction,
    );

    if (!balance || (balance && balance.amount.lessThan(totalAmount))) {
      throw new NotEnoughBalanceForThisOperationError();
    }

    const userHoldAccount = await this.accountService.findOrCreateAccount(
      resolveAccountName([
        AccountNames.Liabilities,
        LiabilitiesAccounts.userBalance,
        ownerId,
        UserBalanceAccouns.hold,
      ]),
    );

    const journal = new LedgerJournalEntity({
      entries: [],
      name: `${Number(totalAmount)} was holded for withdraw`,
    });

    journal.addEntry(
      new LedgerEntryEntity({
        accountId: userHoldAccount.id!,
        account: userHoldAccount,
        amount: totalAmount,
        isCredit: true,
        isRead: true,
        type: EntryType.hold,
        meta: {
          type: EntryType.hold,
          holdAmount: Number(totalAmount),
        },
      }),
    );

    journal.addEntry(
      new LedgerEntryEntity({
        accountId: userAccount.id!,
        amount: totalAmount,
        account: userAccount,
        isCredit: false,
        isRead: true,
        type: EntryType.hold,
        meta: {
          type: EntryType.hold,
          holdAmount: Number(totalAmount),
        },
      }),
    );

    await this.journalService.save(journal, dbTransaction);

    balance.sub(totalAmount);

    const updatedBalance = await this.balanceService.updateBalance(balance, journal, dbTransaction);

    return updatedBalance;
  }

  public async unhold(
    order: PaymentOrder,
    transaction: PaymentTransaction,
    dbTransaction: PrismaTransaction,
  ): Promise<LedgerBalanceEntity> {
    const { ownerId } = order;
    const { originalAmount, networkFee } = transaction;

    const totalAmount = new Decimal(originalAmount!).add(networkFee!);

    const userAccount = await this.accountService.findOrCreateAccount(
      resolveAccountName([
        AccountNames.Liabilities,
        LiabilitiesAccounts.userBalance,
        ownerId,
      ]),
    );

    const balance = await this.balanceService.findBalanceByAccountId(
      userAccount.id!,
      dbTransaction,
    );

    const userHoldAccount = await this.accountService.findOrCreateAccount(
      resolveAccountName([
        AccountNames.Liabilities,
        LiabilitiesAccounts.userBalance,
        ownerId,
        UserBalanceAccouns.hold,
      ]),
    );

    const journal = new LedgerJournalEntity({
      entries: [],
      name: `${Number(totalAmount)} was unholded`,
    });

    journal.addEntry(
      new LedgerEntryEntity({
        accountId: userHoldAccount.id!,
        amount: totalAmount,
        isCredit: false,
        account: userHoldAccount,
        isRead: true,
        type: EntryType.unhold,
        meta: {
          type: EntryType.unhold,
          unholdAmount: Number(totalAmount),
        },
      }),
    );

    journal.addEntry(
      new LedgerEntryEntity({
        accountId: userAccount.id!,
        amount: totalAmount,
        account: userAccount,
        isCredit: true,
        isRead: true,
        type: EntryType.unhold,
        meta: {
          type: EntryType.unhold,
          unholdAmount: Number(totalAmount),
        },
      }),
    );

    await this.journalService.save(journal, dbTransaction);

    balance.add(totalAmount);

    const updatedBalance = await this.balanceService.updateBalance(balance, journal, dbTransaction);

    return updatedBalance;
  }


  public async withdraw(
    order: PaymentOrder,
    currentTransaction: PaymentTransaction,
    updatedTransaction: PaymentTransaction,
    dbTransaction: PrismaTransaction,
  ): Promise<LedgerBalanceEntity> {
    const { ownerId } = order;

    const holdedAmount = new Decimal(currentTransaction.originalAmount!).add(currentTransaction.networkFee!);
    const totalAmount = new Decimal(currentTransaction.originalAmount!).add(updatedTransaction.networkFee!);

    const userAccount = await this.accountService.findOrCreateAccount(
      resolveAccountName([
        AccountNames.Liabilities,
        LiabilitiesAccounts.userBalance,
        ownerId,
      ]),
    );

    const feeAccount = await this.accountService.findOrCreateAccount(
      resolveAccountName([
        AccountNames.Income,
        IncomeAccounts.fee,
        FeesAccounts.withdraw,
      ]),
    );

    const usdAssetAccount = await this.accountService.findOrCreateAccount(
      resolveAccountName([AccountNames.Assets, AssetsAccounts.usd]),
    );

    const userHoldAccount = await this.accountService.findOrCreateAccount(
      resolveAccountName([
        AccountNames.Liabilities,
        LiabilitiesAccounts.userBalance,
        ownerId,
        UserBalanceAccouns.hold,
      ]),
    );

    const balance = await this.balanceService.findBalanceByAccountId(
      userAccount.id!,
      dbTransaction,
    );

    const journal = new LedgerJournalEntity({
      entries: [],
      name: `Withdraw ${Number(updatedTransaction.amount)} ${currentTransaction.currency}`,
    });

    journal.addEntry(
      new LedgerEntryEntity({
        accountId: userHoldAccount.id!,
        amount: holdedAmount,
        isCredit: false,
        isRead: true,
        account: userHoldAccount,
        type: EntryType.unhold,
        meta: {
          type: EntryType.unhold,
          unholdAmount: Number(holdedAmount),
        },
      }),
    );

    if (holdedAmount.minus(totalAmount).gt(0)) {
      const unholdAmount = holdedAmount.minus(totalAmount);

      journal.addEntry(
        new LedgerEntryEntity({
          accountId: userAccount.id!,
          amount: unholdAmount,
          isCredit: true,
          account: userAccount,
          isRead: true,
          type: EntryType.unhold,
          meta: {
            type: EntryType.unhold,
            unholdAmount: Number(unholdAmount),
          },
        }),
      );
  
      balance.add(unholdAmount);
    } else {
      const networkWithdrawFeeAccount = await this.accountService.findOrCreateAccount(
        resolveAccountName([
          AccountNames.Outcome,
          OutcomeAccounts.networkFee,
          NetworkFeeAccounts.withdraw,
        ]),
      );

      journal.addEntry(
        new LedgerEntryEntity({
          accountId: networkWithdrawFeeAccount.id!,
          amount: totalAmount.minus(holdedAmount),
          isCredit: false,
          type: EntryType.networkFee,
          account: networkWithdrawFeeAccount,
          meta: {
            type: EntryType.networkFee,
            feeAmount: Number(updatedTransaction.networkFee),
            orderId: order.id,
          },
        }),
      );
    }

    journal.addEntry(
      new LedgerEntryEntity({
        accountId: usdAssetAccount.id!,
        amount: new Decimal(updatedTransaction.networkFee!),
        account: usdAssetAccount,
        isCredit: true,
        type: EntryType.networkFee,
        meta: {
          type: EntryType.networkFee,
          feeAmount: Number(updatedTransaction.networkFee),
          orderId: order.id,
        },
      }),
    );

    journal.addEntry(
      new LedgerEntryEntity({
        accountId: usdAssetAccount.id!,
        amount: new Decimal(currentTransaction.originalAmount!).sub(currentTransaction.platformFee!),
        isCredit: true,
        account: usdAssetAccount,
        type: EntryType.userWithdraw,
        meta: {
          type: EntryType.userWithdraw,
          amount: Number(updatedTransaction.amount),
          currency: currentTransaction.currency,
          orderId: order.id,
        },
      }),
    );

    journal.addEntry(
      new LedgerEntryEntity({
        accountId: feeAccount.id!,
        amount: currentTransaction.platformFee!,
        isCredit: true,
        type: EntryType.userWithdraw,
        account: feeAccount,
        meta: {
          type: EntryType.userWithdraw,
          amount: Number(updatedTransaction.amount),
          currency: currentTransaction.currency,
          orderId: order.id,
        },
      }),
    );

    await this.journalService.save(journal, dbTransaction);

    const updatedBalance = await this.balanceService.updateBalance(balance, journal, dbTransaction);

    return updatedBalance;
  }
}
