import { LedgerAccountEntity } from '../../entities/account.entity';
import {
  ledgerAccountEntityPropsErrorCases,
  ledgerAccountEntityPropsMock,
} from './fixtures/accountEntity';

describe('Unit Testing Business Behavior of LedgerAccount Entity', () => {
  test('Static method validate', () => {
    for (const errorCase of ledgerAccountEntityPropsErrorCases) {
      const { expectedError, message, props } = errorCase;

      const matchers = expect(() => new LedgerAccountEntity(props));

      matchers.toThrowError(expectedError);
      matchers.toThrow(message);
    }
  });

  test('Static method getPathFromFullName', () => {
    const fullname = 'Test:test:test';
    const fullnamePath = ['Test', 'test', 'test'];

    expect(LedgerAccountEntity.getPathFromFullName(fullname)).toStrictEqual(
      fullnamePath,
    );
  });

  test('Successful creating an ledger account', () => {
    expect(
      () => new LedgerAccountEntity(ledgerAccountEntityPropsMock),
    ).not.toThrow();

    const account = new LedgerAccountEntity(ledgerAccountEntityPropsMock);

    expect(account.getProps()).toStrictEqual(ledgerAccountEntityPropsMock);
    expect(account.parentId).toStrictEqual(null);
    expect(account.accountName).toBe(ledgerAccountEntityPropsMock.name);
    expect(account.id).toBe(undefined);
    expect(account.fullName).toBe(ledgerAccountEntityPropsMock.fullName);
  });
});
