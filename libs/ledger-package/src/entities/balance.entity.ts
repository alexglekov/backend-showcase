import { Decimal } from 'decimal.js';
import { AccountNotProvidedError } from '../errors';
import { LedgerAccountEntity } from './account.entity';

export interface LedgerBalanceEntityProps {
  id?: string | null;
  amount: Decimal;
  account: LedgerAccountEntity;
  accountId: string;
  createdAt: Date;
}

type LedgerBalanceEntityCreateProps = Omit<LedgerBalanceEntityProps, 'createdAt'> & {
  createdAt?: Date;
}

export class LedgerBalanceEntity {
  private readonly props: LedgerBalanceEntityProps;

  constructor(props: LedgerBalanceEntityCreateProps) {
    const preparedProps = {
      ...props,
      createdAt: props.createdAt || new Date(),
    };

    LedgerBalanceEntity.validate(preparedProps);

    this.props = preparedProps;
  }

  static validate(props: LedgerBalanceEntityProps) {
    if (!props.accountId) {
      throw new AccountNotProvidedError();
    }
  }

  static copy(entity: LedgerBalanceEntity) {
    if (!(entity instanceof LedgerBalanceEntity)) throw new Error(`Not instanceof ${LedgerBalanceEntity.name}`);

    const { account, accountId, amount, createdAt, id } = entity.getProps();
    return new LedgerBalanceEntity({
      id,
      account,
      accountId,
      amount: new Decimal(amount.toNumber()),
      createdAt,
    })
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

  get account() {
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
