import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { HttpHeaders, AppHttpHeaders } from '@xyro/core';

import { IAppCredentials } from '../interfaces';

export function AppCredentials(required: boolean = true): ParameterDecorator {
  return createParamDecorator((data: any, context: ExecutionContext): IAppCredentials | null => {
    const [, , ctx] = context.getArgs();

    const { req } = ctx;

    const { headers } = req;

    if (required && (!headers[HttpHeaders.userId] || !headers[AppHttpHeaders.appName])) {
      throw new UnauthorizedException();
    }

    if (headers[HttpHeaders.userId] && headers[AppHttpHeaders.appName]) {
      return {
        userId: headers[AppHttpHeaders.userId],
        appName: headers[AppHttpHeaders.appName],
      };
    }

    return null;
  })();
}
