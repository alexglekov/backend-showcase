import { JsonValue } from '@prisma/client/runtime/library';
import { Decimal } from 'decimal.js';

import { LedgerEntryEntity } from './entry.entity';

export interface LedgerJournalEntityProps {
  id?: string;
  name: string;
  entries: LedgerEntryEntity[];
}

export class LedgerJournalEntity {
  private readonly props: LedgerJournalEntityProps;

  constructor(props: LedgerJournalEntityProps) {
    this.props = props;
  }

  get id() {
    return this.props.id;
  }

  get entries() {
    return this.props.entries;
  }

  public addEntry<MetaType = JsonValue>(entry: LedgerEntryEntity) {
    this.props.entries.push(entry);
  }

  get creditAmount() {
    const entries = this.entries;

    let amount = new Decimal(0);

    entries
      .filter((entry) => entry.isCredit)
      .forEach((entry) => (amount = amount.add(entry.amount)));

    return amount;
  }

  setId(id: string) {
    this.props.id = id;

    this.entries.forEach((entry) => {
      entry.setJournalId(id);
    });
  }

  get debitAmount() {
    const entries = this.entries;

    let amount = new Decimal(0);

    entries
      .filter((entry) => !entry.isCredit)
      .forEach((entry) => (amount = amount.add(entry.amount)));

    return amount;
  }

  public checkIsBalanced(): boolean {
    const debitsAmount = this.debitAmount;
    const creditsAmount = this.creditAmount;

    return debitsAmount.sub(creditsAmount).abs().lte(new Decimal(1e-7));
  }

  getProps() {
    return this.props;
  }
}
