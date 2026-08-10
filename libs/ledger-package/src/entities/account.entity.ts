import {
  AccountNameIsNotCorrectError,
  PossibleIncorrectAccountNameErrors,
} from '../errors';
import { LedgerEntryEntity } from './entry.entity';

export interface LedgerAccountEntityProps {
  id?: string;
  name: string;
  fullName: string;
  parentId: string | null;
  entries: LedgerEntryEntity[];
  createdAt?: Date;
  children: LedgerAccountEntity[];
  isCreditPlus?: boolean;
}

export class LedgerAccountEntity {
  private readonly props: LedgerAccountEntityProps;

  static getPathFromFullName(fullName: string) {
    return fullName.split(':');
  }

  constructor(props: LedgerAccountEntityProps) {
    LedgerAccountEntity.validate(props);
    this.props = props;
  }

  get id() {
    return this.props.id;
  }

  get fullName() {
    return this.props.fullName;
  }

  get accountName() {
    return this.props.name;
  }

  get entries() {
    return this.props.entries;
  }

  get isCreditPlus() {
    return this.props.isCreditPlus;
  }

  get parentId() {
    return this.props.parentId;
  }

  static validate(props: LedgerAccountEntityProps) {
    if (!props.name) {
      throw new AccountNameIsNotCorrectError(
        PossibleIncorrectAccountNameErrors.cannotBeEmpty,
      );
    }

    if (typeof props.name !== 'string') {
      throw new AccountNameIsNotCorrectError(
        PossibleIncorrectAccountNameErrors.nameMustBeString,
      );
    }

    if (props.name.length > 255) {
      throw new AccountNameIsNotCorrectError(
        PossibleIncorrectAccountNameErrors.accountNameSizeExceeded,
      );
    }

    if (!props.fullName) {
      throw new AccountNameIsNotCorrectError(
        PossibleIncorrectAccountNameErrors.cannotBeEmpty,
      );
    }

    if (typeof props.fullName !== 'string') {
      throw new AccountNameIsNotCorrectError(
        PossibleIncorrectAccountNameErrors.nameMustBeString,
      );
    }

    if (props.fullName.length > 1024) {
      throw new AccountNameIsNotCorrectError(
        PossibleIncorrectAccountNameErrors.accountNameSizeExceeded,
      );
    }

    if (props.name.includes('::') || props.fullName.includes('::')) {
      throw new AccountNameIsNotCorrectError(
        PossibleIncorrectAccountNameErrors.incorrectName,
      );
    }

    const re = /[a-zA-Z0-9_:-]*/;
    if (!re.test(props.fullName)) {
      throw new AccountNameIsNotCorrectError(
        PossibleIncorrectAccountNameErrors.incorrectName,
      );
    }

    if (
      props.fullName !== props.name &&
      !props.fullName.endsWith(`:${props.name}`)
    ) {
      throw new AccountNameIsNotCorrectError(
        PossibleIncorrectAccountNameErrors.nameAndFullnameIsNotEqual,
      );
    }
  }

  getProps() {
    return this.props;
  }
}
