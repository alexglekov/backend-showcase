import { HttpStatus, ValidationError } from '@nestjs/common';

import { ObjectException } from './object.exception';

export const validationExceptionFactory = (errors: ValidationError[]) => {
  const [error] = errors;

  const message = error.constraints?.[Object.keys(error.constraints)[0]];

  return new ObjectException(message || 'Bad request', HttpStatus.BAD_REQUEST, '', '');
};
