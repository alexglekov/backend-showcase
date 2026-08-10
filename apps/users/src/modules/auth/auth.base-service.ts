import { Injectable } from '@nestjs/common';
import { Session } from '@prisma/client';

import { SessionsService } from '../sessions/sessions.service';

export interface AfterLoginParams {
  userId: string;
  agent: string;
  ip: string;
}

@Injectable()
export abstract class AuthService {
  constructor(
    protected readonly sessionsService: SessionsService,
  ) {}

  public async afterLogin(
    params: AfterLoginParams,
  ): Promise<Session> {
    const { agent, ip, userId } = params;

    const session = await this.sessionsService.сreate({ agent, ip, userId });

    return session;
  }
}
