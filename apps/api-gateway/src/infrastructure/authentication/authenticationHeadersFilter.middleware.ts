import { HttpHeaders } from '@xyro/core';
import { Request, Response, NextFunction } from 'express';

export const authenticationHeadersFilterMiddleware = (request: Request, response: Response, next: NextFunction) => {
  // clear all custom headers
  delete request.headers[HttpHeaders.userId];
  delete request.headers[HttpHeaders.refreshToken];
  delete request.headers[HttpHeaders.sessionId];
  delete request.headers[HttpHeaders.userAgent];
  delete request.headers[HttpHeaders.userIp];

  delete request.headers[HttpHeaders.gatewayState];

  return next();
}