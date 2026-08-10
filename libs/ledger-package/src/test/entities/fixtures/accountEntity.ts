import { randomBytes } from 'crypto';
import {
  AccountNameIsNotCorrectError,
  PossibleIncorrectAccountNameErrors,
} from '../../../errors';
import { LedgerAccountEntityProps } from '../../../entities/account.entity';

export const ledgerAccountEntityPropsMock: LedgerAccountEntityProps = {
  children: [],
  entries: [],
  fullName: 'Test',
  name: 'Test',
  parentId: null,
};

export const ledgerAccountEntityPropsErrorCases: Array<{
  props: LedgerAccountEntityProps;
  expectedError: new (...args: any[]) => Error;
  message: string;
}> = [
  {
    props: {
      children: [],
      entries: [],
      fullName: 'Test',
      name: undefined,
      parentId: null,
    },
    expectedError: AccountNameIsNotCorrectError,
    message: PossibleIncorrectAccountNameErrors.cannotBeEmpty,
  },
  {
    props: {
      children: [],
      entries: [],
      fullName: 'Test',
      name: randomBytes(300).toString('utf8'),
      parentId: null,
    },
    expectedError: AccountNameIsNotCorrectError,
    message: PossibleIncorrectAccountNameErrors.accountNameSizeExceeded,
  },
  {
    props: {
      children: [],
      entries: [],
      fullName: undefined,
      name: 'Test',
      parentId: null,
    },
    expectedError: AccountNameIsNotCorrectError,
    message: PossibleIncorrectAccountNameErrors.cannotBeEmpty,
  },
  {
    props: {
      children: [],
      entries: [],
      fullName: ['T', 'e', 's', 't'] as any,
      name: 'Test',
      parentId: null,
    },
    expectedError: AccountNameIsNotCorrectError,
    message: PossibleIncorrectAccountNameErrors.nameMustBeString,
  },
  {
    props: {
      children: [],
      entries: [],
      fullName: 'Test',
      name: ['T', 'e', 's', 't'] as any,
      parentId: null,
    },
    expectedError: AccountNameIsNotCorrectError,
    message: PossibleIncorrectAccountNameErrors.nameMustBeString,
  },
  {
    props: {
      children: [],
      entries: [],
      fullName: 'Test',
      name: randomBytes(1025).toString('utf8'),
      parentId: null,
    },
    expectedError: AccountNameIsNotCorrectError,
    message: PossibleIncorrectAccountNameErrors.accountNameSizeExceeded,
  },
  {
    props: {
      children: [],
      entries: [],
      fullName: 'Test::test:::::test',
      name: 'test',
      parentId: null,
    },
    expectedError: AccountNameIsNotCorrectError,
    message: PossibleIncorrectAccountNameErrors.incorrectName,
  },
  {
    props: {
      children: [],
      entries: [],
      fullName: 'Test:test:test',
      name: 'test1',
      parentId: null,
    },
    expectedError: AccountNameIsNotCorrectError,
    message: PossibleIncorrectAccountNameErrors.nameAndFullnameIsNotEqual,
  },
];
