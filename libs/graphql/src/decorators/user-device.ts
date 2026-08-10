import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { HttpHeaders } from '@xyro/core';

import { IUserDevice } from '../interfaces';

export function UserDevice(): ParameterDecorator {
  return createParamDecorator((data: any, context: ExecutionContext): IUserDevice => {
    const [, , ctx] = context.getArgs();

    const { req } = ctx;

    const { headers } = req;

    return {
      userAgent: headers[HttpHeaders.userAgent],
      ip: headers[HttpHeaders.userIp],
    };
  })();
}
