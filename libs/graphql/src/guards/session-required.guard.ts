import { CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { HttpHeaders } from '@xyro/core';

export class SessionRequiredGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);

    const gqlContext = ctx.getContext();

    if (!gqlContext) {
      return false;
    }

    const { headers } = gqlContext.req;

    if (!headers[HttpHeaders.userId] || !headers[HttpHeaders.sessionId]) {
      throw new UnauthorizedException('Unauthorized');
    }

    return true;
  }
}
