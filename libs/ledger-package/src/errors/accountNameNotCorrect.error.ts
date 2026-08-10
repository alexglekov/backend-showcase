import { InternalServerErrorException } from '@nestjs/common';

export enum PossibleIncorrectAccountNameErrors {
  accountNameSizeExceeded = 'Account name cannot be > 255 and < 1 characters. Fullname not exceeded 1024 characters',
  nameMustBeString = 'Field value must be a string',
  cannotBeEmpty = 'Field not provided',
  incorrectName = 'Name should contain alphanumeric characters and colons as delimiters of account names',
  nameAndFullnameIsNotEqual = 'Name and fullname is not equal',
}

export class AccountNameIsNotCorrectError extends InternalServerErrorException {
  constructor(errorMessage: PossibleIncorrectAccountNameErrors) {
    super(errorMessage || 'Account name is not correct');
  }
}
