import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AuthService } from '../services/auth.service';
import { SignInInput } from './models/authInputs.types';
import { clearCookies, setSession } from '../../../infrastructure/utilities/cookies.helper';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => String)
  async signIn(
    @Context() context: any,
    @Args('data') data: SignInInput,
  ): Promise<string> {
    const { token, userId, sessionId, expires } = await this.authService.signIn({
      email: data.email,
      password: data.password,
      rememberSignIn: data.rememberSignIn,
    });

    setSession({
      context,
      token,
      sessionId,
      expires: data.rememberSignIn ? expires : undefined,
    });

    return userId;
  }

  @Mutation(() => String, { nullable: true })
  async signOut(
    @UserCredentials() credentials: IUserCredentials,
    @Context() context: any,
  ): Promise<null> {
    const { sessionId } = credentials;

    await this.authService.signOut({ sessionId });

    clearCookies({ context });

    return null;
  }
}
