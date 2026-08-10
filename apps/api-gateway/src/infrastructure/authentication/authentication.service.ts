import { Inject, Injectable } from '@nestjs/common';
import { Session, UsersService } from '@xyro/contracts/users';
import { AppsNames } from '@xyro/core';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AuthenticationService {
  constructor(@Inject(AppsNames.Users) private readonly usersService: UsersService) {}

  async getSessionById(sessionId: string): Promise<Session | undefined> {
    try {
      const session = await lastValueFrom(this.usersService.getSessionById({ sessionId }));

      return session;
    } catch (e) {
      return undefined;
    }
  }

  async refreshSession(refreshToken: string): Promise<Session | undefined> {
    try {
      const session = await lastValueFrom(this.usersService.refreshSession({
        refreshToken,
      }));

      return session;
    } catch (e) {
      return undefined;
    }
  }
}