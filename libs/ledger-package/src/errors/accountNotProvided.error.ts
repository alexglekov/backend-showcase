import { InternalServerErrorException } from '@nestjs/common';

export class AccountNotProvidedError extends InternalServerErrorException {
  constructor() {
    super(`Account not provided for entity`);
  }
}
