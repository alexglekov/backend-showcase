import { BadRequestException } from '@nestjs/common';

export class MimeTypeIsNotAllowedError extends BadRequestException {
  constructor() {
    super('MimeTypeIsNotAllowedError');
  }
}
