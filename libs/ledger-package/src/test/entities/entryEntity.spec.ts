import { LedgerEntryEntity } from '../../entities/entry.entity';
import { AccountNotProvidedError } from '../../errors';
import {
  incorrectLedgerEntryEntityPropsMock,
  ledgerEntryEntityPropsMock,
} from './fixtures/entryEntity';

describe('Unit Testing Business Behavior of LedgerEntry Entity', () => {
  test('Error creating an ledger entry without providing an account', () => {
    expect(
      () => new LedgerEntryEntity(incorrectLedgerEntryEntityPropsMock),
    ).toThrowError(AccountNotProvidedError);
  });

  test('Creating an ledger entry', () => {
    expect(
      () => new LedgerEntryEntity(ledgerEntryEntityPropsMock),
    ).not.toThrow();

    const entry = new LedgerEntryEntity(ledgerEntryEntityPropsMock);

    expect(entry.amount).toBe(ledgerEntryEntityPropsMock.amount);
    expect(entry.isCredit).toBe(ledgerEntryEntityPropsMock.isCredit);
  });
});
