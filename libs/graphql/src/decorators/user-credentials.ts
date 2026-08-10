import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { HttpHeaders } from '@xyro/core';

import { IUserCredentials } from '../interfaces';

export function UserCredentials(required: boolean = true): ParameterDecorator {
  return createParamDecorator((data: any, context: ExecutionContext): IUserCredentials | null => {
    const [, , ctx] = context.getArgs();

    const { req } = ctx;

    const { headers } = req;

    if (required && (!headers[HttpHeaders.userId] || !headers[HttpHeaders.sessionId])) {
      throw new UnauthorizedException();
    }

    if (headers[HttpHeaders.userId] && headers[HttpHeaders.sessionId]) {
      return {
        userId: headers[HttpHeaders.userId],
        refreshToken: headers[HttpHeaders.refreshToken],
        sessionId: headers[HttpHeaders.sessionId],
        userAgent: headers[HttpHeaders.userAgent],
        userIp: headers[HttpHeaders.userIp],
      };
    }

    return null;
  })();
}
