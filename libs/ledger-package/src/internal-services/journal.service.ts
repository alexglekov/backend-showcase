import { Injectable } from '@nestjs/common';
import { Entry, Journal } from '@prisma/client';

import { LedgerJournalEntity } from '../entities/journal.entity';
import { EntryService } from './entry.service';
import { JournalIsNotBalancedError } from '../errors';
import { LedgerPrismaService } from './prisma.service';
import { PrismaTransaction } from '@xyro/libs/utils';

@Injectable()
export class JournalService {
  constructor(
    private readonly prismaService: LedgerPrismaService,
    private readonly entriesService: EntryService,
  ) {}

  public async findJournalsByName(
    jorunalName: string,
  ): Promise<LedgerJournalEntity[]> {
    const journals = await this.prismaService.journal.findMany({
      where: {
        name: jorunalName,
      },
    });

    return journals.map((journal) => this.mapOrmEntityToDomainEntity(journal)!);
  }

  public async findJournalsByNameWithEntries(
    jorunalName: string,
  ): Promise<LedgerJournalEntity[]> {
    const journals = await this.prismaService.journal.findMany({
      where: {
        name: jorunalName,
      },
      include: {
        entries: true,
      },
    });

    return journals.map((journal) => this.mapOrmEntityToDomainEntity(journal)!);
  }

  public async save(
    journal: LedgerJournalEntity,
    transaction: PrismaTransaction,
  ): Promise<LedgerJournalEntity> {
    if (!journal.checkIsBalanced()) {
      throw new JournalIsNotBalancedError();
    }

    const { entries, name } = journal.getProps();

    const resource = transaction || this.prismaService;

    const { id } = await resource.journal.create({
      data: {
        name,
      },
    });

    journal.setId(id);

    await this.entriesService.saveMultiple(entries, transaction);

    return journal;
  }

  public mapOrmEntityToDomainEntity(
    journal?: Journal & { entries?: Entry[] },
  ): LedgerJournalEntity | null {
    if (!journal) return null;

    const entries = journal.entries
      ? journal.entries.map((entry) =>
          this.entriesService.mapOrmEntityToDomainEntity(entry)!,
        )
      : [];

    return new LedgerJournalEntity({
      id: journal.id,
      name: journal.name,
      entries,
    });
  }
}
