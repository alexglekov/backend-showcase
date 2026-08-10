import { Test, TestingModule } from '@nestjs/testing';
import { Decimal } from 'decimal.js';

import { AccountService } from '../../internal-services/account.service';
import { PaymentLedgerService } from '../../external-services/paymentLedger.service';
import { EntryService } from '../../internal-services/entry.service';
import { resolveAccountName } from '../../core/accountNames.util';
import { AccountNames, LiabilitiesAccounts } from '../../core/enums';
import {
  cleanDatabaseAfterEach,
  initDatabaseAfterEach,
} from '../fixtures/chores';
import { JournalService } from '../../internal-services/journal.service';
import { BalanceService } from '../../internal-services/balance.service';
import {
  createTestUpDownBetFactory,
  createTestUpDownGameFactory,
  createTestUserFactory,
} from '../fixtures/factories';
import { GameLedgerService } from '../../external-services/gameLedger.service';
import { NotEnoughBalanceForThisOperationError } from '../../errors';
import { LedgerPrismaService } from '../../internal-services/prisma.service';
import { GameTypeEnum } from '@prisma/client';

describe('Unit Testing of Game Ledger Service Create Bet Method', () => {
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
        GameLedgerService,
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

  // test('Create Bet with enough money', async () => {
  //   const paymentLedgerService = module.get(PaymentLedgerService);
  //   const gameLedgerService = module.get(GameLedgerService);
  //   const balanceService = module.get(BalanceService);
  //   const accountService = module.get(AccountService);
  //   const entryService = module.get(EntryService);

  //   const testUser = createTestUserFactory();
  //   const testGame = createTestUpDownGameFactory();
  //   const testBet = createTestUpDownBetFactory();
  //   const depositAmount = new Decimal(1000);
  //   const depositWithFeeAmount = depositAmount.sub(
  //     depositAmount.mul(platformFee),
  //   );
  //   const betAmount = new Decimal(100);

  //   await expect(
  //     paymentLedgerService.deposit(testUser.id, depositAmount, platformFee),
  //   ).resolves.toBe(undefined);

  //   const testUserAccount = await accountService.findOrCreateAccount(
  //     resolveAccountName([
  //       AccountNames.Liabilities,
  //       LiabilitiesAccounts.userBalance,
  //       testUser.id,
  //     ]),
  //   );

  //   await expect(balanceService.refreshBalances()).resolves.toBeInstanceOf(Map);

  //   const balanceBeforeCreateBet = await balanceService.findBalanceByAccountId(
  //     testUserAccount.id!,
  //   );

  //   expect(balanceBeforeCreateBet.amount).toStrictEqual(depositWithFeeAmount);

  //   await expect(
  //     gameLedgerService.createBet(testUser.id, betAmount, testGame.id, testBet.id, GameTypeEnum.UPDOWN),
  //   ).resolves.toBe(undefined);

  //   await expect(balanceService.refreshBalances()).resolves.toBeInstanceOf(Map);

  //   const balanceAfterCreateBet = await balanceService.findBalanceByAccountId(
  //     testUserAccount.id!,
  //   );

  //   expect(balanceAfterCreateBet.amount).toStrictEqual(
  //     balanceBeforeCreateBet.amount.sub(betAmount),
  //   );

  //   const testAccountEntries = await entryService.findEntriesByAccountId(
  //     testUserAccount.id!,
  //   );

  //   const betsAccount = await accountService.findOrCreateAccount(
  //     resolveAccountName([
  //       AccountNames.Liabilities,
  //       LiabilitiesAccounts.bets,
  //       testGame.id,
  //     ]),
  //   );

  //   const betsAccountEntries = await entryService.findEntriesByAccountId(
  //     betsAccount.id!,
  //   );

  //   expect(testAccountEntries.length).toBe(2);
  //   expect(betsAccountEntries.length).toBe(1);

  //   const [testAccountDepositEntry, testAccountBetEntry] = testAccountEntries;
  //   const [betsAccountEntry] = betsAccountEntries;

  //   expect(testAccountDepositEntry.amount).toStrictEqual(depositWithFeeAmount);
  //   expect(testAccountDepositEntry.isCredit).toBe(true);
  //   expect(testAccountBetEntry.amount).toStrictEqual(betAmount);
  //   expect(testAccountBetEntry.isCredit).toBe(false);
  //   expect(betsAccountEntry.amount).toStrictEqual(betAmount);
  //   expect(betsAccountEntry.isCredit).toBe(true);
  // });

  test('Create Bet with empty balance', async () => {
    const gameLedgerService = module.get(GameLedgerService);
    const balanceService = module.get(BalanceService);
    const accountService = module.get(AccountService);
    const entryService = module.get(EntryService);

    const testUser = createTestUserFactory();
    const testGame = createTestUpDownGameFactory();
    const testBet = createTestUpDownBetFactory();
    const betAmount = new Decimal(100);

    const testUserAccount = await accountService.findOrCreateAccount(
      resolveAccountName([
        AccountNames.Liabilities,
        LiabilitiesAccounts.userBalance,
        testUser.id,
      ]),
    );

    const balanceBeforeCreateBet = await balanceService.findBalanceByAccountId(
      testUserAccount.id!,
    );

    expect(balanceBeforeCreateBet.amount).toStrictEqual(new Decimal(0));

    await expect(
      gameLedgerService.createBet(testUser.id, betAmount, testGame.id, testBet.id, GameTypeEnum.UPDOWN),
    ).rejects.toThrowError(NotEnoughBalanceForThisOperationError);

    await expect(balanceService.refreshBalances()).resolves.toBeInstanceOf(Map);

    const balanceAfterCreateBet = await balanceService.findBalanceByAccountId(
      testUserAccount.id!,
    );

    expect(balanceAfterCreateBet.amount).toStrictEqual(new Decimal(0));

    const testAccountEntries = await entryService.findEntriesByAccountId(
      testUserAccount.id!,
    );

    expect(testAccountEntries.length).toBe(0);

    const betsAccount = await accountService.findAccount(
      resolveAccountName([
        AccountNames.Liabilities,
        LiabilitiesAccounts.bets,
        testGame.id,
      ]),
    );

    expect(betsAccount).toBe(null);
  });
});
