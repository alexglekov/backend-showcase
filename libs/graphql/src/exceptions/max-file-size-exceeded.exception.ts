import { BadRequestException } from '@nestjs/common';

export class MaxFileSizeExceededError extends BadRequestException {

  constructor() {
    super('MaxFileSizeExceededError');
  }
}
