import { ArgumentsHost, Catch, ContextType, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { GqlContextType } from '@nestjs/graphql';
import { Environment } from '@xyro/core';

import { ExceptionBase } from './exception.base';
import { GraphQLExceptionFactory } from './graphql-exception.factory';
import { ObjectException } from './object.exception';
import { Response } from 'express';

@Catch(Error)
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly env: Environment) {}

  private getErrorByContextType(host: ArgumentsHost, error: ExceptionBase) {
    const contextType = host.getType() as GqlContextType | ContextType;

    if (contextType === 'graphql') {
      throw GraphQLExceptionFactory.getException(error);
    } else {
      const response: Response = host.switchToHttp().getResponse();
      const json = error.toJSON();

      return response.status(json.code).send(json);
    }
  }

  catch(exception: ExceptionBase | Error, host: ArgumentsHost) {
    let message: string | undefined;
    let code: number;
    let stack: string | undefined;
    let metadata: string | undefined;

    if (exception instanceof ExceptionBase) {
      const errorObject = exception.toJSON();

      message = errorObject.message;
      code = errorObject.code;
      stack = errorObject.stack;
      metadata = errorObject.metadata;
    } else if (exception instanceof HttpException) {
      if (exception.getStatus() >= HttpStatus.INTERNAL_SERVER_ERROR) {
        message = 'Internal server error...';
      } else {
        message = exception.message;
      }
      code = exception.getStatus();
      stack = exception.stack;
      metadata = undefined;
    } else {
      message = 'Internal server error...';
      code = 500;
      stack = exception.stack;
      metadata = exception.message;
    }

    if (this.env !== Environment.development) {
      stack = '';
      metadata = undefined;
    }

    const error = new ObjectException(message, code, stack ?? '', metadata);

    return this.getErrorByContextType(host, error);
  }
}
