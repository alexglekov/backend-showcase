import { Injectable } from '@nestjs/common';
import { Entry, EntryType, GameTypeEnum } from '@prisma/client';
import { PrismaTransaction } from '@xyro/libs/utils';

import { LedgerEntryEntity } from '../entities/entry.entity';
import { LedgerAccountEntity } from '../entities/account.entity';
import { LedgerJournalEntity } from '../entities/journal.entity';
import { AccountNotProvidedError } from '../errors';
import { LedgerPrismaService } from './prisma.service';

interface GetCountEntriesBy {
  accountId: string;
  type?: EntryType;
  gameMode?: GameTypeEnum;
}

interface FindEntriesBy {
  accountId: string;
  type?: EntryType;
  gameMode?: GameTypeEnum;

  take?: number,
  skip?: number
}

interface FindUnreadEntriesParams {
  accountWhitelist: string[],
  take: number,
  transaction?: PrismaTransaction
}



@Injectable()
export class EntryService {
  constructor(private readonly prismaService: LedgerPrismaService) {}

  public async saveMultiple(
    entries: LedgerEntryEntity[],
    transaction: PrismaTransaction
  ): Promise<LedgerEntryEntity[]> {
    const resource = transaction;

    await resource.entry.createMany({
      data: entries.map((entry) => {
        const props = entry.getProps();

        return {
          amount: props.amount,
          isCredit: props.isCredit,
          accountId: props.accountId,
          createdAt: props.createdAt,
          details: props.details,
          type: props.type,
          journalId: props.journalId,
          meta: props.meta,
          isRead: props.isRead || false,
        };
      }),
    });

    return entries;
  }

  public async findEntriesBy(
    params: FindEntriesBy,
    transaction?: PrismaTransaction,
  ): Promise<LedgerEntryEntity[]> {
    const resource = transaction || this.prismaService;

    const entries = await resource.entry.findMany({
      where: {
        accountId: params.accountId,
        type: params.type,
        meta: params.gameMode ? {
          path: ['gameType'],
          equals: params.gameMode,
        } : undefined,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: params.take,
      skip: params.skip,
    });

    return entries.map((entry) => this.mapOrmEntityToDomainEntity(entry)!);
  }

  public async findEntriesByAccountIdForPeriod(
    accountId: string,
    from: Date,
    to: Date,
    transaction?: PrismaTransaction
  ): Promise<LedgerEntryEntity[]> {
    const resource = transaction || this.prismaService;

    const entries = await resource.entry.findMany({
      where: {
        AND: [
          {
            accountId,
          },
          {
            createdAt: {
              gte: from,
              lte: to,
            },
          },
        ],
      },
    });

    return entries.map((entry) => this.mapOrmEntityToDomainEntity(entry)!);
  }

  public async countEntriesBy(
    params: GetCountEntriesBy,
    transaction?: PrismaTransaction
  ): Promise<number> {
    const resource = transaction || this.prismaService;

    return resource.entry.count({
      where: {
        accountId: params.accountId,
        type: params.type,
        meta: params.gameMode ? {
          path: ['gameType'],
          equals: params.gameMode,
        } : undefined,
      },
    });
  }

  public async markEntriesAsRead(
    entryIds: string[],
    transaction?: PrismaTransaction
  ) {
    const resource = transaction || this.prismaService;

    await resource.entry.updateMany({
      where: {
        id: {
          in: entryIds,
        },
      },
      data: {
        isRead: true,
      },
    });
  }
  public async findUnreadEntries(
    params: FindUnreadEntriesParams,
  ) {
    const { accountWhitelist, take, transaction } = params;

    const resource = transaction || this.prismaService;

    const entries = await resource.entry.findMany({
      where: {
        AND: [
          {
            isRead: false,
          },
          {
            account: {
              OR: accountWhitelist.map((accountName) => ({
                fullName: {
                  startsWith: accountName,
                },
              })),
            },
          },
        ],
      },
      take,
    });

    return entries.map((entry) => this.mapOrmEntityToDomainEntity(entry)!);
  }

  public async findEntriesByAccountIds(
    accountIds: Array<string>,
    transaction?: PrismaTransaction
  ) {
    const resource = transaction || this.prismaService;

    const entries = await resource.entry.findMany({
      where: {
        accountId: {
          in: accountIds,
        },
      },
    });

    return entries.map((entry) => this.mapOrmEntityToDomainEntity(entry));
  }

  public mapOrmEntityToDomainEntity(
    entry: Entry,
    account?: LedgerAccountEntity,
    journal?: LedgerJournalEntity
  ): LedgerEntryEntity | null {
    if (!entry) return null;

    const accountId = entry.accountId || account?.id;
    const journalId = entry.journalId || journal?.id;

    if (!accountId) {
      throw new AccountNotProvidedError();
    }

    return new LedgerEntryEntity({
      accountId,
      amount: entry.amount,
      createdAt: entry.createdAt,
      isCredit: entry.isCredit,
      account,
      journalId,
      details: entry.details,
      type: entry.type,
      meta: entry.meta as any,
      id: entry.id,
    });
  }
}
