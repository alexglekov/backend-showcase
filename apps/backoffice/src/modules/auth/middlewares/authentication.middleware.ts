import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { HttpHeaders } from '@xyro/core';

import { AuthService } from '../services/auth.service';
import { clientConfig } from '../../../infrastructure/config';
import { parseCookies, setSession } from '../../../infrastructure/utilities';

@Injectable()
export class AuthenticationMiddleware implements CanActivate {
  constructor(
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { req, res } = context.getArgByIndex(2);

    const cookies = req.cookies || parseCookies(req?.headers?.cookie || '');

    if (!cookies) return true;
    if (!cookies[clientConfig.cookies.sessionToken]) return true;

    req.headers[HttpHeaders.userAgent] = req.headers['user-agent'];
    req.headers[HttpHeaders.userIp] = req.ip;

    const token = cookies[clientConfig.cookies.sessionToken];
    const sessionId = cookies[clientConfig.cookies.sessionId];

    if (sessionId) {
      const tokenPayload = await this.authService.getSession(sessionId);
      
      if (tokenPayload) {
        req.headers[HttpHeaders.userId] = tokenPayload!.userId;
        req.headers[HttpHeaders.refreshToken] = token;
        req.headers[HttpHeaders.sessionId] = sessionId;
        
        return true;
      }
    }

    if (!token) return true;

    try {
      const refreshedSession = await this.authService.refreshSession(token);

      setSession({
        context: { res, req },
        sessionId: refreshedSession.sessionId,
        token: refreshedSession.token,
        expires: refreshedSession.expires
      })

      req.headers[HttpHeaders.userId] = refreshedSession.userId;
      req.headers[HttpHeaders.refreshToken] = refreshedSession.token;
      req.headers[HttpHeaders.sessionId] = refreshedSession.sessionId;
    } catch {}

    return true;
  }
}