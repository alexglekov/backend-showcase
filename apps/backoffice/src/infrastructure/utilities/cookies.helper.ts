import { Request, Response } from 'express';

import { clientConfig } from '../config';

interface SetSessionParams {
  context: { res: Response, req: Request};
  token: string;
  sessionId: string;
  expires?: {
    sessionId: number;
    token: number;
  };
}

interface ClearCookiesParams {
  context: { res: Response };
}

export function setSession(params: SetSessionParams) {
  const { context, token, sessionId, expires } = params;

  const { req } = context;

  const secure = req?.protocol === 'https';

  context.res.cookie(clientConfig.cookies.sessionToken, token, {
    httpOnly: true,
    secure,
    maxAge: expires?.token ? expires.token * 1000 : undefined,
  });

  context.res.cookie(clientConfig.cookies.sessionId, sessionId, {
    httpOnly: true,
    secure,
    maxAge: expires?.sessionId ? expires.sessionId * 1000 : undefined,
  });
}

export function clearCookies(params: ClearCookiesParams) {
  const { context } = params;

  context.res.clearCookie(clientConfig.cookies.sessionToken);
  context.res.clearCookie(clientConfig.cookies.sessionId);
}

export function parseCookies(cookie: string) {
  return cookie
  .split(';')
  .map(v => v.split('='))
  .reduce((acc, v) => {
    acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
    return acc;
  }, {} as Record<string, string>);
}