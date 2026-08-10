import { Request, Response } from 'express';

export interface GraphQLContextBase {
  req: Request;
  res: Response;
}

export interface GraphQLContext extends GraphQLContextBase {
  passthroughCookies?: string | null;
  updateCookies?: {
    refreshToken: string;
    sessionId: string;
    expires?: {
      refreshToken?: number;
      session?: number;
    }
  };
  user: {
    ip?: string;
    refreshToken?: string;
    sessionId?: string;
    userAgent?: string;
  };
}
