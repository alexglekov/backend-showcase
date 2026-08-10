import { Decimal } from 'decimal.js';

import { LedgerEntryEntityProps } from '../../../entities/entry.entity';

export const incorrectLedgerEntryEntityPropsMock: LedgerEntryEntityProps<unknown> =
  {
    accountId: null!,
    amount: new Decimal(100),
    isCredit: true,
    meta: {},
  };

export const ledgerEntryEntityPropsMock: LedgerEntryEntityProps<unknown> = {
  accountId: 'someid',
  amount: new Decimal(100),
  isCredit: true,
  meta: {},
};
