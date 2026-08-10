import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Account, Entry, Prisma } from '@prisma/client';
import { PrismaTransaction } from '@xyro/libs/utils'

import { LedgerAccountEntity } from '../entities/account.entity';
import { EntryService } from './entry.service';
import { ParentAccountNotFoundError } from '../errors';
import { ledgerSystemAccounts } from '../core/constants';
import { AccountNames, LiabilitiesAccounts } from '../core/enums';
import { BalanceService } from './balance.service';
import { LedgerPrismaService } from './prisma.service';
import { resolveAccountName } from '../core/accountNames.util';

export type AccountWhereProps = Prisma.AccountWhereInput;

interface CreateAccountParams {
  accountName: string;
  fullName: string;
  parentId: string | null;
  isCreditPlus: boolean;
}

@Injectable()
export class AccountService {
  constructor(
    private readonly prismaService: LedgerPrismaService,
    private readonly entryService: EntryService,
    @Inject(forwardRef(() => BalanceService))
    private readonly balanceService: BalanceService,
  ) {}

  public async createIfNotExistSystemAccounts() {
    for (const account of ledgerSystemAccounts) {
      await this.findOrCreateAccount(account);
    }
  }

  public async findAccountWithEntries(where: AccountWhereProps) {
    const account = await this.prismaService.account.findFirst({
      where,
      include: {
        children: true,
        entries: true,
      },
    });

    return this.mapOrmEntityToDomainEntity(account);
  }

  public async findAccount(
    fullName: string,
    dbTransaction?: PrismaTransaction,
  ): Promise<LedgerAccountEntity | null> {
    const resource = dbTransaction || this.prismaService;

    const account = await resource.account.findFirst({
      where: {
        fullName,
      },
    });

    return this.mapOrmEntityToDomainEntity(account);
  }

  public async findAccountById(
    id: string,
  ): Promise<LedgerAccountEntity | null> {
    const account = await this.prismaService.account.findFirst({
      where: {
        id,
      },
    });

    return this.mapOrmEntityToDomainEntity(account);
  }

  public async findAccounts(name: string) {
    const accounts = await this.prismaService.account.findMany({
      where: {
        fullName: {
          startsWith: name,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return accounts.map((account) => this.mapOrmEntityToDomainEntity(account));
  }

  public async existsAccount(fullName: string): Promise<boolean> {
    const found = await this.findAccount(fullName);

    return Boolean(found);
  }

  public async findOrCreateAccount(
    fullName: string,
    dbTransaction?: PrismaTransaction,
  ): Promise<LedgerAccountEntity> {
    const existAccount = await this.findAccount(fullName, dbTransaction);

    if (existAccount) {
      return existAccount;
    }

    const accountPath = LedgerAccountEntity.getPathFromFullName(fullName);

    const accountName = accountPath[accountPath.length - 1];

    const isCreditPlus = this.determineIsCreditPlus(fullName);

    let parentId: string | null = null;

    if (accountPath.length > 1) {
      const parentFullName = accountPath.slice(0, -1).join(':');

      const parent = await this.findAccount(parentFullName, dbTransaction);

      if (!parent) {
        throw new ParentAccountNotFoundError(parentFullName);
      }

      parentId = parent.id!;
    }

    let account: Account;

    if (dbTransaction) {
      account = await this.createAccount(
        {
          accountName,
          fullName,
          isCreditPlus,
          parentId,
        },
        dbTransaction
      );
    } else {
      account = await this.prismaService.$transaction(async (transaction) => {
        return this.createAccount({
          accountName,
          fullName,
          isCreditPlus,
          parentId
        }, transaction);
      });
    }

    return this.mapOrmEntityToDomainEntity(account)!;
  }

  private async createAccount(params: CreateAccountParams, dbTransaction: PrismaTransaction) {
    const account = await dbTransaction.account.create({
      data: {
        name: params.accountName,
        fullName: params.fullName,
        parent: params.parentId
          ? {
              connect: {
                id: params.parentId,
              },
            }
          : undefined,
        isCreditPlus: params.isCreditPlus,
      },
    });

    if (params.fullName.startsWith(
      resolveAccountName([
        AccountNames.Liabilities,
        LiabilitiesAccounts.userBalance,
      ])
    )) {
      await this.balanceService.createBalance(account.id, null, dbTransaction);
    }

    return account;
  }

  private determineIsCreditPlus(accountfullName: string): boolean {
    if (
      accountfullName.startsWith(AccountNames.Liabilities) ||
      accountfullName.startsWith(AccountNames.Income)
    ) {
      return true;
    } else {
      return false;
    }
  }

  public mapOrmEntityToDomainEntity(
    account?: Account & { entries?: Entry[]; children?: Account[] } | null,
  ): LedgerAccountEntity | null {
    if (!account) return null;

    const entries = account.entries
      ? account.entries.map((entry) =>
          this.entryService.mapOrmEntityToDomainEntity(entry)!,
        )
      : [];

    const children = account.children
      ? account.children.map((children) =>
          this.mapOrmEntityToDomainEntity(children)!,
        )
      : [];

    return new LedgerAccountEntity({
      id: account.id,
      name: account.name,
      fullName: account.fullName,
      parentId: account.parentId,
      createdAt: account.createdAt,
      isCreditPlus: account.isCreditPlus,
      children,
      entries,
    });
  }
}
