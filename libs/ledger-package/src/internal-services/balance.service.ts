import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Account, Balance, Prisma } from '@prisma/client';
import { PrismaTransaction } from '@xyro/libs/utils';
import { Decimal } from 'decimal.js';
import { LoggerService } from '@xyro/libs/logger';

import { EntryService } from './entry.service';
import { LedgerBalanceEntity } from '../entities/balance.entity';
import { AccountNames, LiabilitiesAccounts } from '../core/enums';
import { resolveAccountName } from '../core/accountNames.util';
import { AccountService } from './account.service';
import { LedgerAccountEntity } from '../entities/account.entity';
import { LedgerPrismaService } from './prisma.service';
import { LedgerJournalEntity } from '../entities/journal.entity';

type FindFilteredBalancesByAccountIdParams = {
  startDate?: Date;
  endDate?: Date;
  accountId: string;
}

const DEFAULT_READ_ENTRIES_BATCH_AMOUNT = 100;

@Injectable()
export class BalanceService {
  constructor(
    private readonly logger: LoggerService,
    private readonly prismaService: LedgerPrismaService,
    private readonly entriesService: EntryService,
    @Inject(forwardRef(() => AccountService))
    private readonly accountService: AccountService,
  ) {
    this.logger.setContext(BalanceService.name);
  }

  public async findBalanceByAccountId(
    accountId: string,
    transaction?: PrismaTransaction,
  ): Promise<LedgerBalanceEntity> {
    const resource = transaction ?? this.prismaService;

    const balanceOrmEntity = await resource.balance.findFirst({
      relationLoadStrategy: 'join',
      where: {
        accountId,
      },
      include: {
        account: true,
      },
    });

    return this.mapOrmEntityToDomainEntity(
      balanceOrmEntity!,
      balanceOrmEntity?.account
        ? this.accountService.mapOrmEntityToDomainEntity(balanceOrmEntity?.account)
        : await this.accountService.findAccountById(accountId),
    );
  }

  public async findFilteredBalancesByAccountId(
    { startDate, endDate, accountId }: FindFilteredBalancesByAccountIdParams,
  ): Promise<LedgerBalanceEntity[]> {
    const where: Prisma.BalanceHistoryWhereInput = {
      AND: [
        { accountId },
        { createdAt: startDate ? { gte: startDate } : undefined },
        { createdAt: endDate ? { lte: endDate } : undefined },
      ],
    };

    const balancesOrmEntities =
      await this.prismaService.balanceHistory.findMany({
        where,
        orderBy: {
          createdAt: 'asc',
        },
        include: {
          account: true,
        },
      });

    return balancesOrmEntities.map((balanceOrmEntity) =>
      this.mapOrmEntityToDomainEntity(balanceOrmEntity),
    );
  }

  public async createBalance(
    accountId: string,
    journal: LedgerJournalEntity | null,
    transaction?: PrismaTransaction,
  ) {
    const resource = transaction || this.prismaService;

    await Promise.all([
      resource.balance.create({
        data: {
          amount: new Decimal(0),
          accountId,
        },
      }),
      resource.balanceHistory.create({
        data: {
          amount: new Decimal(0),
          journalId: journal?.id || undefined,
          accountId,
        },
      }),
    ]);
  }

  public async updateBalance(
    balance: LedgerBalanceEntity,
    journal: LedgerJournalEntity | null,
    transaction?: PrismaTransaction,
  ) {
    const resource = transaction ?? this.prismaService;

    const [updatedBalance] = await Promise.all([
      resource.balance.update({
        data: {
          amount: balance.amount,
        },
        where: {
          accountId: balance.accountId,
        },
      }),
      resource.balanceHistory.create({
        data: {
          amount: balance.amount,
          accountId: balance.accountId,
          journalId: journal?.id || undefined,
        },
      }),
    ]);

    return this.mapOrmEntityToDomainEntity(updatedBalance);
  }

  public async updateBalanceByAccountId(
    accountId: string,
    amount: Decimal,
    journal?: LedgerJournalEntity,
    transaction?: PrismaTransaction,
  ) {
    const resource = transaction ?? this.prismaService;

    const updatedBalance = await resource.balance.update({
      data: {
        amount: {
          increment: amount,
        },
      },
      where: {
        accountId,
      },
    });

    await resource.balanceHistory.create({
      data: {
        amount: updatedBalance.amount,
        accountId: updatedBalance.accountId,
        journalId: journal?.id || undefined,
      },
    });

    return this.mapOrmEntityToDomainEntity(updatedBalance);
  }

  public async refreshBalances(): Promise<Map<string, LedgerBalanceEntity>> {
    try {
      const unreadEntriesLiabilitiesUserBalance =
        await this.entriesService.findUnreadEntries({
          accountWhitelist: [
            resolveAccountName([
              AccountNames.Liabilities,
              LiabilitiesAccounts.userBalance,
            ]),
          ],
          take: DEFAULT_READ_ENTRIES_BATCH_AMOUNT,
        });

      const unreadEntries = [...unreadEntriesLiabilitiesUserBalance];

      if (unreadEntries.length > 0) {
        const unreadEntriesIds = unreadEntries.map((entry) => entry.id!);

        const updatedBalances = this.prismaService.$transaction(
          async (transaction: PrismaTransaction) => {
            const balances = new Map<string, LedgerBalanceEntity>();

            const updatingBalancesPromises: Promise<unknown>[] = [];
            for (const entry of unreadEntries) {
              if (!balances.has(entry.accountId)) {
                const lastBalance = await this.findBalanceByAccountId(
                  entry.accountId,
                  transaction,
                );

                balances.set(entry.accountId, lastBalance);
              }

              const currentBalance = balances.get(entry.accountId)!;

              const account = currentBalance.getAccount();

              if (entry.isCredit) {
                if (account.isCreditPlus) {
                  currentBalance.add(new Decimal(entry.amount));
                } else {
                  currentBalance.sub(new Decimal(entry.amount));
                }
              } else {
                if (account.isCreditPlus) {
                  currentBalance.sub(new Decimal(entry.amount));
                } else {
                  currentBalance.add(new Decimal(entry.amount));
                }
              }

              updatingBalancesPromises.push(
                this.updateBalance(
                  LedgerBalanceEntity.copy(currentBalance),
                  new LedgerJournalEntity({
                    id: entry.journalId,
                    entries: [],
                    name: '',
                  }),
                  transaction
                )
              )
            }

            // here handle by journals

            await Promise.all([
              ...updatingBalancesPromises,
              this.entriesService.markEntriesAsRead(
                unreadEntriesIds,
                transaction,
              ),
            ]);

            return balances;
          },
          {
            timeout: 20000,
          }
        );

        this.logger.log({
          action: 'User balances have been updated successfully',
          payload: {
            unreadEntriesIds,
          }
        });

        return updatedBalances;
      }

      this.logger.log('No balance refresh entries');

      return new Map();
    } catch (error: any) {
      this.logger.error({
        action: 'Error occures during handle BalanceService.refreshBalances',
        payload: {
          errorMessage: error.message,
          errorStack: error.stack,
        },
      });

      return new Map();
    }
  }

  public mapOrmEntityToDomainEntity(
    balance: Partial<Balance> & { account?: Account },
    account?: LedgerAccountEntity | null,
  ): LedgerBalanceEntity {
    return new LedgerBalanceEntity({
      id: balance?.id || null,
      amount: balance?.amount || new Decimal(0),
      createdAt: balance?.createdAt || new Date(),
      accountId: (balance?.accountId || account?.id)!,
      account: account
        ? account
        : this.accountService.mapOrmEntityToDomainEntity(balance.account)!,
    });
  }
}
