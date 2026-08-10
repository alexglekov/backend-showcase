import { InternalServerErrorException } from '@nestjs/common';

export class JournalIsNotBalancedError extends InternalServerErrorException {
  constructor() {
    super('Journal is not balanced');
  }
}
