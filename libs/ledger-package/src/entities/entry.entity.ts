import { Decimal } from 'decimal.js';
import { EntryType, GameTypeEnum } from '@prisma/client';

import { AccountNotProvidedError } from '../errors';
import { LedgerAccountEntity } from './account.entity';

type GameResolveEntryMeta = {
  type: typeof EntryType.gameResolve;
  gameType: GameTypeEnum;
  gameId: string;
}

type HourlyFeeEntryMeta = {
  type: typeof EntryType.hourlyFee;
  gameId: string;
}

type UserAddBetEntryMeta = {
  type: typeof EntryType.userAddBet;
  gameType: GameTypeEnum;
  gameId: string;
  betId: string;
}

type UserDepositEntryMeta = {
  type: typeof EntryType.userDeposit;
  currency: string;
  amount: number;
  orderId: string;
}

type NetworkFeeEntryMeta = {
  type: typeof EntryType.networkFee;
  feeAmount: number;
  orderId: string;
}

type UserWithdrawEntryMeta = {
  type: typeof EntryType.userWithdraw;
  currency: string;
  amount: number;
  orderId: string;
}

type BonusEntryMeta = {
  type: typeof EntryType.bonus;
  reason: string;
  amount: number;
}

type BonusRemovedEntryMeta = {
  type: typeof EntryType.bonusRemoved;
  reason: string;
  amount: number;
}

type UserLoseEntryMeta = {
  type: typeof EntryType.userLose;
  loseAmount: number;
  gameId: string;
  gameType: GameTypeEnum;
  betId: string;
}

type UserRejectedBetEntryMeta = {
  type: typeof EntryType.userRejectedBet;
  gameId: string;
  gameType: GameTypeEnum;
  betId: string;
}

type UserWonEntryMeta = {
  type: typeof EntryType.userWon;
  gameId: string;
  gameType: GameTypeEnum;
  betId: string;
}

type NotDefinedMeta = {
  type: typeof EntryType.notDefined;
  gameId: string;
  betId: string;
}

type HoldMeta = {
  type: typeof EntryType.hold;
  holdAmount: number;
}

type UnholdMeta = {
  type: typeof EntryType.unhold;
  unholdAmount: number;
}

export type EntryMeta = 
  | GameResolveEntryMeta
  | HourlyFeeEntryMeta
  | UserAddBetEntryMeta
  | UserDepositEntryMeta
  | UserWithdrawEntryMeta
  | UserLoseEntryMeta
  | UserRejectedBetEntryMeta
  | UserWonEntryMeta
  | HoldMeta
  | UnholdMeta
  | NetworkFeeEntryMeta
  | BonusEntryMeta
  | BonusRemovedEntryMeta
  | NotDefinedMeta;

export interface LedgerEntryEntityProps {
  id?: string;
  isCredit: boolean;
  amount: Decimal;
  meta: EntryMeta;
  type: EntryType;
  details: string;
  accountId: string;
  isRead?: boolean;
  journalId?: string;
  createdAt?: Date;

  account?: LedgerAccountEntity;
}

export class LedgerEntryEntity {
  private readonly props: LedgerEntryEntityProps;

  constructor(props: Omit<LedgerEntryEntityProps, 'details'> & { details?: string }) {
    const details = props.details || LedgerEntryEntity.generateDetails(props);

    LedgerEntryEntity.validate({
      ...props,
      details,
    });

    this.props = {
      ...props,
      details,
    };
  }

  get id() {
    return this.props.id;
  }

  get accountId() {
    return this.props.accountId;
  }

  get account() {
    return this.props.account;
  }

  get details() {
    return this.props.details;
  }

  get createdAt() {
    return this.props.createdAt || new Date();
  }

  get type() {
    return this.props.type;
  }

  get amount() {
    return this.props.amount;
  }

  get isCredit() {
    return this.props.isCredit === true;
  }

  get isRead() {
    return this.props.isRead === true;
  }

  get journalId(): string | undefined {
    return this.props.journalId;
  }

  setJournalId(id: string) {
    this.props.journalId = id;
  }

  getId() {
    return this.props.id;
  }

  getProps() {
    return this.props;
  }

  static generateDetails(props: Omit<LedgerEntryEntityProps, 'details'>): string {
    const { meta } = props;
    const { type } = meta;

    switch (type) {
      case EntryType.gameResolve: {
        const { gameId, gameType } = meta;

        if (gameType === GameTypeEnum.BULLSEYE) return `Bulls-Eye game ${gameId} resolved`;
        if (gameType === GameTypeEnum.ONEVSONE) return `1 vs 1 game ${gameId} resolved`;
        if (gameType === GameTypeEnum.UPDOWN) return `Up/Down game ${gameId} resolved`;
        if (gameType === GameTypeEnum.SETUP) return `Setup game ${gameId} resolved`;
        if (gameType === GameTypeEnum.X1000) return `X1000 game ${gameId} resolved`;

        return 'Details not supported game';
      }

      case EntryType.userRejectedBet: {
        const { gameType } = meta;

        if (gameType === GameTypeEnum.BULLSEYE) return 'Bulls-Eye game rejected';
        if (gameType === GameTypeEnum.ONEVSONE) return '1 vs 1 game rejected';
        if (gameType === GameTypeEnum.UPDOWN) return 'Up/Down game rejected';
        if (gameType === GameTypeEnum.SETUP) return 'Setup game rejected';
        if (gameType === GameTypeEnum.X1000) return 'X1000 game rejected';

        return '';
      }

      case EntryType.userWon: {
        const { gameType } = meta;

        if (gameType === GameTypeEnum.BULLSEYE) return 'Bulls-Eye';
        if (gameType === GameTypeEnum.ONEVSONE) return '1 vs 1';
        if (gameType === GameTypeEnum.UPDOWN) return 'Up/Down';
        if (gameType === GameTypeEnum.SETUP) return 'Setup';
        if (gameType === GameTypeEnum.X1000) return 'X1000';

        return '';
      }

      case EntryType.notDefined: {
        return `No details`;
      }

      case EntryType.userDeposit: {
        const { amount, currency } = meta;

        return `Deposit ${amount} ${currency}`;
      }

      case EntryType.userWithdraw: {
        const { amount, currency } = meta;

        return `Withdrawal ${amount} ${currency}`;
      }

      case EntryType.hold: {
        return `Holded`;
      }

      case EntryType.unhold: {
        return `Unholded`;
      }

      case EntryType.networkFee: {
        return `Network fee`;
      }

      case EntryType.hourlyFee: {
        return `Hourly fee`;
      }

      case EntryType.userAddBet: {
        const { gameType } = meta;

        if (gameType === GameTypeEnum.BULLSEYE) return 'Bulls-Eye game created';
        if (gameType === GameTypeEnum.ONEVSONE) return '1 vs 1 game created';
        if (gameType === GameTypeEnum.UPDOWN) return 'Up/Down game created';
        if (gameType === GameTypeEnum.SETUP) return 'Setup game created';
        if (gameType === GameTypeEnum.X1000) return 'X1000 game created';

        return '';
      }

      case EntryType.userLose: {
        const { gameType } = meta;

        if (gameType === GameTypeEnum.BULLSEYE) return 'Bulls-Eye';
        if (gameType === GameTypeEnum.ONEVSONE) return '1 vs 1';
        if (gameType === GameTypeEnum.UPDOWN) return 'Up/Down';
        if (gameType === GameTypeEnum.SETUP) return 'Setup';
        if (gameType === GameTypeEnum.X1000) return 'X1000';

        return '';
      }

      case EntryType.bonus: {
        const { reason } = meta;

        return reason;
      }

      case EntryType.bonusRemoved: {
        const { reason } = meta;

        return reason;
      }

      default : return ``;
    }
  }

  static validate(props: LedgerEntryEntityProps) {
    if (!props.accountId) {
      throw new AccountNotProvidedError();
    }
  }
}
