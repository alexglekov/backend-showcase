import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@xyro/libs/redis';
import { DomainEventsPublisher } from '@xyro/libs/events';
import { UserCreatedDomainEvent } from '@xyro/contracts/users';
import { TwitterService } from '@xyro/contracts/twitter';
import { AppsNames } from '@xyro/core';
import { lastValueFrom } from 'rxjs';

import { UsersService } from '../../users';
import { AuthService } from '../auth.base-service';
import { PrismaService } from '../../../infrastructure/prisma';
import { SessionsService } from '../../sessions/sessions.service';
import { ReferralsService } from '../../referrals/referrals.service';
import { Config } from '../../../infrastructure/config';

type VerifyTwitterOAuth2Params = {
  code: string;
  state: string;
  redirectUri: string;
}

type SignInWithTwitterOAuth2Params = VerifyTwitterOAuth2Params & {
  agent: string;
  ip: string;
}

type SignUpWithTwitterOAuth2Params = VerifyTwitterOAuth2Params & {
  ip: string;
  agent: string;
  username: string;
  referralCode: string;
}

type AttachTwitterParams = VerifyTwitterOAuth2Params & {
  userId: string;
}

interface GetTwitterAuthUriParams {
  redirectUri: string;
}

@Injectable()
export class AuthTwitterService extends AuthService {
  constructor(
    @Inject(AppsNames.Twitter) private readonly twitterService: TwitterService,
    protected readonly configService: ConfigService<Config>,
    private readonly redisClient: RedisService,
    private readonly usersService: UsersService,
    protected readonly prismaService: PrismaService,
    protected readonly sessionsService: SessionsService,
    protected readonly referralsService: ReferralsService,
    protected readonly domainEventsPublisher: DomainEventsPublisher,
  ) {
    super(sessionsService);
  }

  public async getTwitterAuthUri(params: GetTwitterAuthUriParams): Promise<string> {
    const { redirectUri } = params;
    const { tokenExpiresAt } = this.configService.get('twitter');

    const { url, state, codeVerifier } = await lastValueFrom(this.twitterService.getOAuth2Uri({ redirectUri }));

    await this.redisClient.set(
      this.getRedisKeyForToken(state),
      codeVerifier,
      { expiresInSeconds: tokenExpiresAt }
    );

    return url;
  }

  public async attachTwitter(params: AttachTwitterParams): Promise<void> {
    const { userId } = params;

    const codeVerifier = await this.redisClient.get<string>(this.getRedisKeyForToken(params.state), false);

    if (!codeVerifier) {
      throw new BadRequestException('Incorrect Twitter OAuth2 code');
    }

    const twitterUser = await lastValueFrom(this.twitterService.loginWithOAuth2({
      code: params.code,
      redirectUri: params.redirectUri,
      codeVerifier,
    }));

    await this.usersService.updateUser(userId, {
      twitterId: twitterUser.id,
    });
  }

  async signIn(params: SignInWithTwitterOAuth2Params) {
    const { agent, ip } = params;

    const codeVerifier = await this.redisClient.get<string>(this.getRedisKeyForToken(params.state), false);

    if (!codeVerifier) {
      throw new BadRequestException('Incorrect Twitter OAuth2 code');
    }

    const twitterUser = await lastValueFrom(this.twitterService.loginWithOAuth2({
      code: params.code,
      redirectUri: params.redirectUri,
      codeVerifier,
    }));

    const user = await this.usersService.findByTwitterId(twitterUser.id);

    if (!user) {
      throw new BadRequestException(`User not found, please sign up.`);
    }

    return this.afterLogin({
      agent,
      ip,
      userId: user.id,
    });
  }

  async signUp(params: SignUpWithTwitterOAuth2Params) {
    const { agent, ip, referralCode, username } = params;

    const codeVerifier = await this.redisClient.get<string>(this.getRedisKeyForToken(params.state), false);

    if (!codeVerifier) {
      throw new BadRequestException('Incorrect Twitter OAuth2 code');
    }

    const twitterUser = await lastValueFrom(this.twitterService.loginWithOAuth2({
      code: params.code,
      redirectUri: params.redirectUri,
      codeVerifier,
    }));

    const referral = await this.referralsService.checkReferralAvalability({
      code: referralCode,
    });

    const user = await this.prismaService.$transaction(
      async (dbTransaction) => {
        const user = await this.usersService.createUser(
          {
            name: username,
            twitterId: twitterUser.id,
          },
          dbTransaction
        );

        await this.referralsService.takeReferral(
          {
            userId: user.id,
            referrerId: referral.userId,
          },
          dbTransaction,
        );

        return user;
      },
    );

    await this.domainEventsPublisher.publish(new UserCreatedDomainEvent(user, referral));

    return this.afterLogin({
      agent,
      ip,
      userId: user.id,
    });
  }

  private getRedisKeyForToken(state: string) {
    return `oauth2:twitter:${state}`;
  }
}
