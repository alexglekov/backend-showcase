import { GraphQLRequestContext, GraphQLRequestListener } from '@apollo/server';
import SetCookieParser from 'set-cookie-parser';
import type { CookieOptions } from 'express';

import { clientConfig } from '../../config';

import { ServerContext } from './interfaces';

export class CookieServerListener implements GraphQLRequestListener<ServerContext> {
  constructor(private readonly domains: Array<string>) {}

  public willSendResponse({ contextValue }: GraphQLRequestContext<ServerContext>): Promise<void> {
    const { req } = contextValue;
    const secure = req?.protocol === 'https';

    if (contextValue.res) {
      const cookies = SetCookieParser.parse(SetCookieParser.splitCookiesString(contextValue.passthroughCookies), {
        decodeValues: true,
        map: true,
      });

      for (const cookie of Object.keys(cookies)) {
        for (const domain of this.domains) {
          const { maxAge } = cookies[cookie];

          let updateValue: string | undefined;
          let updateMaxAge: number | undefined = maxAge;

          if (contextValue.updateCookies) {
            if (cookie === clientConfig.cookies.refreshToken) {
              updateValue = contextValue.updateCookies.refreshToken;
              updateMaxAge = contextValue.updateCookies.expires?.refreshToken;
            }

            if (cookie === clientConfig.cookies.sessionId) {
              updateValue = contextValue.updateCookies.sessionId;
              updateMaxAge = contextValue.updateCookies.expires?.session;
            }
          }

          contextValue.res.cookie(cookie, updateValue || cookies[cookie].value, {
            ...cookies[cookie],
            secure,
            maxAge: updateMaxAge ? updateMaxAge * 1000 : undefined,
            expires: undefined,
            httpOnly: true,
            path: '/',
            domain: domain ? domain : undefined,
            sameSite: secure ? 'none' : undefined,
          } as CookieOptions);
        }
      }
    }

    return Promise.resolve();
  }
}
