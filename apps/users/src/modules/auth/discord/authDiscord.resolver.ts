import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { IUserCredentials, IUserDevice, UserCredentials, UserDevice, Void } from '@xyro/libs/graphql';
import { ConfigService } from '@nestjs/config';

import { Config } from '../../../infrastructure/config';
import { AuthDiscordService } from './authDiscord.service';
import { AttachDiscordInput, GetDiscordAuthUriInput, VerifyOAuth2DiscordInput } from './discordInputs.types';
import { setSession } from '../cookies.helper';

@Resolver()
export class AuthDiscordResolver {
  constructor(
    private readonly authDiscordService: AuthDiscordService,
    private readonly configService: ConfigService<Config>,
  ) {}

  @Query(() => String)
  async getDiscordAuthUri(
    @Args('data') payload: GetDiscordAuthUriInput,
  ) {
    return this.authDiscordService.getDiscordAuthUri(payload);
  }

  @Mutation(() => Void)
  async attachDiscord(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') data: AttachDiscordInput,
  ) {
    const { userId } = credentials;

    await this.authDiscordService.attachDiscord({
      userId: userId,
      state: data.state,
      code: data.code,
      redirectUri: data.redirectUri,
    });

    return new Void();
  }

  @Mutation(() => String)
  async verifyDiscord(
    @Context() context: any,
    @UserDevice() device: IUserDevice,
    @Args('data') data: VerifyOAuth2DiscordInput,
  ): Promise<string> {
    const { ip, userAgent } = device;

    const { refreshToken, id, userId } =
      await this.authDiscordService.verifyDiscord({
        ip,
        agent: userAgent,
        code: data.code,
        state: data.state,
        username: data.username,
        redirectUri: data.redirectUri,
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

    return userId;
  }
}
