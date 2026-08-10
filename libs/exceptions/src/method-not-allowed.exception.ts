import { MethodNotAllowedException } from '@nestjs/common';
import { capitalize } from 'lodash';

export class MethodNotAllowedOnStageException extends MethodNotAllowedException {
  constructor(stage: string) {
    super(`Method not allowed on ${capitalize(stage.toLowerCase())}`);
  }
}
