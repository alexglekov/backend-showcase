import { InternalServerErrorException } from '@nestjs/common';

export class AccountNotFoundError extends InternalServerErrorException {
  constructor(fullName: string) {
    super(`Account ${fullName} not found`);
  }
}
