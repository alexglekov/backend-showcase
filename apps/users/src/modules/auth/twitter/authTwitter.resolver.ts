import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { IUserCredentials, IUserDevice, UserCredentials, UserDevice, Void } from '@xyro/libs/graphql';
import { ConfigService } from '@nestjs/config';

import { AuthTwitterService } from './authTwitter.service';
import {
  GetTwitterAuthUriGraphQLInput,
  AttachTwitterGraphQLInput,
  SignInWithOAuth2TwitterGraphQLInput,
  SignUpWithOAuth2TwitterGraphQLInput,
} from './twitterInputs.types';
import { setSession } from '../cookies.helper';
import { Config } from '../../../infrastructure/config';

@Resolver()
export class AuthTwitterResolver {
  constructor(
    private readonly authTwitterService: AuthTwitterService,
    private readonly configService: ConfigService<Config>,
  ) {}

  @Query(() => String)
  async getTwitterAuthUri(
    @Args('data') payload: GetTwitterAuthUriGraphQLInput,
  ) {
    return this.authTwitterService.getTwitterAuthUri(payload);
  }

  @Mutation(() => Void)
  async attachTwitter(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') data: AttachTwitterGraphQLInput,
  ) {
    const { userId } = credentials;

    await this.authTwitterService.attachTwitter({
      userId: userId,
      ...data,
    });

    return new Void();
  }

  @Mutation(() => String)
  async signInWithOAuth2Twitter(
    @Context() context: any,
    @UserDevice() device: IUserDevice,
    @Args('data') data: SignInWithOAuth2TwitterGraphQLInput,
  ): Promise<string> {
    const { ip, userAgent } = device;

    const { refreshToken, id, userId } = await this.authTwitterService.signIn({
      agent: userAgent,
      ip,
      ...data,
    });

    const { sessionExpiresAt, refreshTokenExpiresAt } = this.configService.get('jwt');

    setSession({
      context,
      refreshToken,
      sessionId: id,
      expires: {
        session: sessionExpiresAt,
        refreshToken: refreshTokenExpiresAt,
      },
    });

    return userId;
  }

  @Mutation(() => String)
  async signUpWithOAuth2Twitter(
    @Context() context: any,
    @UserDevice() device: IUserDevice,
    @Args('data') data: SignUpWithOAuth2TwitterGraphQLInput,
  ): Promise<string> {
    const { ip, userAgent } = device;

    const { refreshToken, id, userId } = await this.authTwitterService.signUp({
      agent: userAgent,
      ip,
      ...data,
    });

    const { sessionExpiresAt, refreshTokenExpiresAt } = this.configService.get('jwt');

    setSession({
      context,
      refreshToken,
      sessionId: id,
      expires: {
        session: sessionExpiresAt,
        refreshToken: refreshTokenExpiresAt,
      },
    });

    return userId;
  }
}
