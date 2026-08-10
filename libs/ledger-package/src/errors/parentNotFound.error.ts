import { InternalServerErrorException } from '@nestjs/common';

export class ParentAccountNotFoundError extends InternalServerErrorException {
  constructor(parentFullName: string) {
    super(`Parent account ${parentFullName} not found`);
  }
}
