import { Test, TestingModule } from '@nestjs/testing';
import { Decimal } from 'decimal.js';

import { AccountService } from '../../internal-services/account.service';
import { PaymentLedgerService } from '../../external-services/paymentLedger.service';
import { EntryService } from '../../internal-services/entry.service';
import { resolveAccountName } from '../../core/accountNames.util';
import {
  AccountNames,
  AssetsAccounts,
  FeesAccounts,
  IncomeAccounts,
  LiabilitiesAccounts,
} from '../../core/enums';
import {
  cleanDatabaseAfterEach,
  initDatabaseAfterEach,
} from '../fixtures/chores';
import { JournalService } from '../../internal-services/journal.service';
import { BalanceService } from '../../internal-services/balance.service';
import { createTestUserFactory } from '../fixtures/factories';
import { NotEnoughBalanceForThisOperationError } from '../../errors';
import { LedgerPrismaService } from '../../internal-services/prisma.service';

describe('Unit Testing of Payment Ledger Service', () => {
  const platformFee = new Decimal(0.01);
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        LedgerPrismaService,
        AccountService,
        EntryService,
        JournalService,
        BalanceService,
        PaymentLedgerService,
      ],
    }).compile();
    module.enableShutdownHooks();
  });

  beforeEach(async () => {
    const accountService = module.get(AccountService);

    await initDatabaseAfterEach({
      accountService,
    });
  });

  afterEach(async () => {
    const prismaService = module.get(LedgerPrismaService);

    await cleanDatabaseAfterEach(prismaService);
  });

  afterAll(async () => {
    await module.close();
  });

  // test('Deposit to Account', async () => {
  //   const paymentLedgerService = module.get(PaymentLedgerService);

  //   const testUser = createTestUserFactory();
  //   const depositAmount = new Decimal(1000);
  //   const depositAmountWithFee = depositAmount.sub(
  //     depositAmount.mul(platformFee),
  //   );
  //   const depositFeeAmount = depositAmount.mul(platformFee);

  //   await expect(
  //     paymentLedgerService.deposit(testUser.id, depositAmount, platformFee),
  //   ).resolves.toBe(undefined);

  //   const accountService = module.get(AccountService);
  //   const entryService = module.get(EntryService);

  //   const assetAccount = await accountService.findOrCreateAccount(
  //     resolveAccountName([AccountNames.Assets, AssetsAccounts.usd]),
  //   );

  //   const testUserAccount = await accountService.findOrCreateAccount(
  //     resolveAccountName([
  //       AccountNames.Liabilities,
  //       LiabilitiesAccounts.userBalance,
  //       testUser.id,
  //     ]),
  //   );

  //   const feeAccount = await accountService.findOrCreateAccount(
  //     resolveAccountName([
  //       AccountNames.Income,
  //       IncomeAccounts.fee,
  //       FeesAccounts.deposit,
  //     ]),
  //   );

  //   const testAccountEntries = await entryService.findEntriesByAccountId(
  //     testUserAccount.id!,
  //   );
  //   const assetAccountEntries = await entryService.findEntriesByAccountId(
  //     assetAccount.id!,
  //   );
  //   const feeAccountEntries = await entryService.findEntriesByAccountId(
  //     feeAccount.id!,
  //   );

  //   expect(testAccountEntries.length).toBe(1);
  //   expect(assetAccountEntries.length).toBe(1);
  //   expect(feeAccountEntries.length).toBe(1);

  //   const [testAccountEntry] = testAccountEntries;
  //   const [assetAccountEntry] = assetAccountEntries;
  //   const [feeAccountEntry] = feeAccountEntries;

  //   expect(testAccountEntry.amount).toStrictEqual(depositAmountWithFee);
  //   expect(testAccountEntry.isCredit).toBe(true);
  //   expect(assetAccountEntry.amount).toStrictEqual(depositAmount);
  //   expect(assetAccountEntry.isCredit).toBe(false);
  //   expect(feeAccountEntry.amount).toStrictEqual(depositFeeAmount);
  //   expect(feeAccountEntry.isCredit).toBe(true);
  // });

  // test('Error in withdrawing from Account with empty balance', async () => {
  //   const paymentLedgerService = module.get(PaymentLedgerService);

  //   const testUser = createTestUserFactory();
  //   const withdrawAmount = new Decimal(1000);

  //   await expect(
  //     paymentLedgerService.withdraw(testUser.id, withdrawAmount, platformFee),
  //   ).rejects.toThrowError(NotEnoughBalanceForThisOperationError);
  // });

  // test('Withdraw from Account with enough money', async () => {
  //   const paymentLedgerService = module.get(PaymentLedgerService);
  //   const accountService = module.get(AccountService);
  //   const balanceService = module.get(BalanceService);

  //   const testUser = createTestUserFactory();
  //   const depositAmount = new Decimal(1000);
  //   const withdrawAmount = new Decimal(
  //     depositAmount.sub(depositAmount.mul(platformFee)),
  //   );

  //   const testAccount = await accountService.findOrCreateAccount(
  //     resolveAccountName([
  //       AccountNames.Liabilities,
  //       LiabilitiesAccounts.userBalance,
  //       testUser.id,
  //     ]),
  //   );

  //   const balanceBeforeDeposit = await balanceService.findBalanceByAccountId(
  //     testAccount.id!,
  //   );

  //   expect(balanceBeforeDeposit.amount).toStrictEqual(new Decimal(0));

  //   await expect(
  //     paymentLedgerService.deposit(testUser.id, depositAmount, platformFee),
  //   ).resolves.toBe(undefined);

  //   await expect(balanceService.refreshBalances()).resolves.toBeInstanceOf(Map);

  //   const balanceAfterDeposit = await balanceService.findBalanceByAccountId(
  //     testAccount.id!,
  //   );

  //   expect(balanceAfterDeposit.amount).toStrictEqual(withdrawAmount);

  //   await expect(
  //     paymentLedgerService.withdraw(testUser.id, withdrawAmount, platformFee),
  //   ).resolves.toBe(undefined);

  //   await expect(balanceService.refreshBalances()).resolves.toBeInstanceOf(Map);

  //   const balanceAfterWithdraw = await balanceService.findBalanceByAccountId(
  //     testAccount.id!,
  //   );

  //   expect(balanceAfterWithdraw.amount).toStrictEqual(new Decimal(0));
  // });
});
