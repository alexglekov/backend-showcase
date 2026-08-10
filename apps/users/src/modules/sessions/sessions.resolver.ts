import { Context, Mutation, Resolver } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';

import { SessionsService } from './sessions.service';
import { clearCookies } from '../auth/cookies.helper';


@Resolver()
export class SessionsResolver {
  constructor(private readonly sessionsService: SessionsService) {}

  @Mutation(() => String, { nullable: true })
  async signout(
    @Context() context: any,
    @UserCredentials() credentials: IUserCredentials
  ) {
    const { refreshToken, sessionId, userId } = credentials;

    await this.sessionsService.signOut({
      userId,
      refreshToken,
      sessionId,
    });

    clearCookies(context);

    return null;
  }

}
