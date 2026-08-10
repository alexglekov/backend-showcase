import { Decimal } from 'decimal.js';

import { AccountNotProvidedError } from '../errors';
import { LedgerAccountEntity } from './account.entity';

export interface LedgerBalanceHistoryEntityProps {
  id?: string | null;
  amount: Decimal;
  account: LedgerAccountEntity;
  journalId?: string;
  accountId: string;
  createdAt?: Date;
}

export class LedgerBalanceHistoryEntity {
  private readonly props: LedgerBalanceHistoryEntityProps;

  constructor(props: LedgerBalanceHistoryEntityProps) {
    LedgerBalanceHistoryEntity.validate(props);

    this.props = props;
  }

  static validate(props: LedgerBalanceHistoryEntityProps) {
    if (!props.accountId) {
      throw new AccountNotProvidedError();
    }
  }

  public add(amount: Decimal) {
    this.props.amount = this.props.amount.add(amount);
  }

  public sub(amount: Decimal) {
    this.props.amount = this.props.amount.sub(amount);
  }

  public getAccount() {
    return this.props.account;
  }

  get amount() {
    return this.props.amount;
  }

  get accountId() {
    return this.props.accountId;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get id() {
    return this.props.id;
  }

  getProps() {
    return this.props;
  }
}
