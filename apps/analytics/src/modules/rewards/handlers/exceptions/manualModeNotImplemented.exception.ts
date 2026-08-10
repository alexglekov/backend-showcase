import { BadRequestException } from '@nestjs/common';

export class ManualModeNotImplementedException extends BadRequestException {
  constructor () {
    super('This task cannot be checked manually.');
  }
}
