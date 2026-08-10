import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { IUserDevice, UserDevice } from '@xyro/libs/graphql';
import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthBaseService } from './authBase.service';
import { SignInInput, SignUpInput } from './authBaseInputs.types';
import { setSession } from '../cookies.helper';
import { Config } from '../../../infrastructure/config';

@Resolver()
export class AuthBaseResolver {
  constructor(
    private readonly authBaseService: AuthBaseService,
    private readonly configService: ConfigService<Config>,
  ) {}

  @Query(() => String)
  async signin(
    @Context() context: ExecutionContext,
    @Args('data') data: SignInInput,
    @UserDevice() device: IUserDevice,
  ): Promise<string> {
    const { ip, userAgent } = device;

    const { id, refreshToken, userId } = await this.authBaseService.signIn({
      agent: userAgent,
      ip,
      email: data.email,
      password: data.password,
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

    // what return?
    return userId;
  }

  @Mutation(() => String)
  async signup(
    @Context() context: ExecutionContext,
    @UserDevice() device: IUserDevice,
    @Args('data') data: SignUpInput,
  ): Promise<string> {
    const { ip, userAgent } = device;

    const { id, refreshToken, userId } = await this.authBaseService.signUp({
      agent: userAgent,
      ip,
      name: data.name,
      email: data.email,
      password: data.password,
      referralCode: data.referralCode,
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

    // what return?
    return userId;
  }
}
