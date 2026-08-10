import { InternalServerErrorException } from '@nestjs/common';

export class AutoModeNotImplementedException extends InternalServerErrorException {
  constructor () {
    super('This task cannot be checked automatically.');
  }
}
