import { clientConfig } from '../../config';

import { GraphQLContext, GraphQLContextBase } from './interfaces';

export const contextHandler = (context: GraphQLContextBase): Omit<GraphQLContext, 'req'> => {
  const { req, res } = context;
  const { headers, ip, cookies } = req;

  const { 'user-agent': userAgent } = headers;

  const sessionId = cookies?.[clientConfig.cookies.sessionId] || '';
  const refreshToken = cookies?.[clientConfig.cookies.refreshToken] || '';

  return {
    res,
    user: {
      userAgent,
      ip,
      sessionId,
      refreshToken,
    },
  };
};
