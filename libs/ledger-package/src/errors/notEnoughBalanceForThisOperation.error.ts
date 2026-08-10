import { BadRequestException } from '@nestjs/common';

export class NotEnoughBalanceForThisOperationError extends BadRequestException {
  constructor() {
    super('Not enough balance for this operation.');
  }
}
