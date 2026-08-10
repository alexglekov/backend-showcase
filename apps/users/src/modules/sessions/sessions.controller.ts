import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import {
  GetSessionByIdPayload,
  Session,
  RefreshSessionPayload,
  GetCountUserDailyLoginsPayload,
  GetCountUserDailyLoginsResult
} from '@xyro/contracts/users';
import { ConfigService } from '@nestjs/config';

import { SessionsService } from './sessions.service';
import { Config } from '../../infrastructure/config';

@Controller()
export class SessionsController {
  constructor(
    private readonly sessionService: SessionsService,
    private readonly configService: ConfigService<Config>,
  ) {}

  @GrpcMethod('UsersService', 'GetSessionById')
  async getSessionById(data: GetSessionByIdPayload): Promise<Session> {
    try {
      const result = await this.sessionService.getById({ sessionId: data.sessionId });

      return {
        refreshToken: result.refreshToken,
        sessionId: result.id,
        userId: result.userId
      };
    } catch (e) {
      throw new RpcException(e);
    }
  }

  @GrpcMethod('UsersService', 'GetCountUserDailyLogins')
  async getCountUserDailyLogins(data: GetCountUserDailyLoginsPayload): Promise<GetCountUserDailyLoginsResult> {
    const countUserDailyLogins = await this.sessionService.getCountUserDailyLogins({ userId: data.userId });

    return {
      userId: data.userId,
      countDailyLogins: countUserDailyLogins,
    }
  }

  @GrpcMethod('UsersService', 'RefreshSession')
  async refreshSession(
    data: RefreshSessionPayload
  ): Promise<Session> {
    try {
      const { refreshToken } = data;

      const result = await this.sessionService.refreshSession({ refreshToken });

      const { refreshTokenExpiresAt, sessionExpiresAt } = this.configService.get('jwt');

      return {
        refreshToken: result.refreshToken,
        sessionId: result.id,
        userId: result.userId,
        expiration: {
          session: sessionExpiresAt,
          refreshToken: refreshTokenExpiresAt,
        }
      };
    } catch(e) {
      throw new RpcException(e);
    }
  }

}
