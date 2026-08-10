import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { IUserCredentials, IUserDevice, UserCredentials, UserDevice, Void } from '@xyro/libs/graphql';
import { ConfigService } from '@nestjs/config';

import { AuthMetamaskService } from './authMetamask.service';
import {
  AttachWalletInput,
  GetMetamaskChallengeInput,
  MetamaskChallengeGraphQLEntity,
  VerifyMetamaskSignatureInput,
} from './metamaskInputs.types';
import { setSession } from '../cookies.helper';
import { Config } from '../../../infrastructure/config';

@Resolver()
export class AuthMetamaskResolver {
  constructor(
    private readonly authMetamaskService: AuthMetamaskService,
    private readonly configService: ConfigService<Config>,
  ) {}

  @Query(() => MetamaskChallengeGraphQLEntity)
  async getMetamaskChallenge(@Args('data') data: GetMetamaskChallengeInput): Promise<MetamaskChallengeGraphQLEntity> {
    const payload = await this.authMetamaskService.getChallenge(data);

    return new MetamaskChallengeGraphQLEntity(payload);
  }

  @Mutation(() => Void)
  async attachWallet(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') data: AttachWalletInput,
  ) {
    const { userId } = credentials;

    await this.authMetamaskService.attachWallet({
      userId: userId,
      signature: data.signature,
      walletAddress: data.walletAddress,
    });

    return new Void();
  }

  @Mutation(() => String)
  async verifyMetamaskSignature(
    @Context() context: any,
    @UserDevice() device: IUserDevice,
    @Args('data') data: VerifyMetamaskSignatureInput,
  ): Promise<string> {
    const { ip, userAgent } = device;
    const { refreshToken, id, userId } =
      await this.authMetamaskService.verifySignature({
        agent: userAgent,
        ip,
        signature: data.signature,
        walletAddress: data.walletAddress,
        username: data.username,
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
