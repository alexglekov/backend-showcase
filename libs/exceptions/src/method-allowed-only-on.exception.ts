import { MethodNotAllowedException } from '@nestjs/common';
import { capitalize } from 'lodash';

export class MethodAllowedOnlyOnStagesException extends MethodNotAllowedException {
  constructor(stages: string[]) {
    super(`Method allowed only on ${stages.map((stage) => capitalize(stage.toLowerCase())).join(', ')}`);
  }
}
