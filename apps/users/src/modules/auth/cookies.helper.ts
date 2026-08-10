import { CookieOptions } from 'express';
import { clientConfig } from '../../infrastructure/config';

interface SetSessionParams {
  context: any;
  refreshToken: string;
  sessionId: string;
  expires?: {
    /**
     * @field in seconds
     */
    session: number;
    /**
     * @field in seconds
     */
    refreshToken: number;
  };
}

export function setSession(params: SetSessionParams) {
  const { context, refreshToken, sessionId, expires } = params;

  context.res.cookie(clientConfig.cookies.sessionId, sessionId, {
    httpOnly: true,
    secure: true,
    maxAge: expires?.session ? expires.session * 1000 : undefined,
  } as CookieOptions);

  context.res.cookie(clientConfig.cookies.refreshToken, refreshToken, {
    httpOnly: true,
    secure: true,
    maxAge: expires?.refreshToken ? expires.refreshToken * 1000 : undefined,
  } as CookieOptions);
}


export function clearCookies(context: any) {
  context.res.clearCookie(clientConfig.cookies.refreshToken);
  context.res.clearCookie(clientConfig.cookies.sessionId);
}
