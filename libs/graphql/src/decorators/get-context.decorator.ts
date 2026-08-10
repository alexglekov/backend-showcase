import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { HttpContext } from '../interfaces';

export function GetHttpContext(): ParameterDecorator {
  return createParamDecorator((data: any, context: ExecutionContext): HttpContext => {
    const [, , ctx] = context.getArgs();

    const { req, res } = ctx;

    return {
      request: req,
      response: res,
    };
  })();
}
