import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { LoggerService } from '@xyro/libs/logger';
import { RedisService } from '@xyro/libs/redis';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { TwitterApi } from 'twitter-api-v2';
import {
  GetOAuth2UriPayload,
  LoginWithOAuth2Payload,
  getTwitterAccountCacheKey
} from '@xyro/contracts/twitter';
import { lastValueFrom } from 'rxjs';

import { PrismaService } from '../../infrastructure/prisma';
import { Config } from '../../infrastructure/config';
import { MAX_ACCOUNT_CACHE_TTL_SECONDS } from '../../infrastructure/constants';

@Injectable()
export class TwitterAuthService {
  constructor(
    private readonly logger: LoggerService,
    private readonly httpService: HttpService,
    private readonly redisService: RedisService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService<Config>,
  ) {
    this.logger.setContext(TwitterAuthService.name);
  }

  public async refreshTokens(twitterId: string, refreshToken: string) {
    const tokens = await this.clientFactory().refreshOAuth2Token(refreshToken);

    await this.prismaService.twitterAuthToken.update({
      where: {
        twitterId,
      },
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      }
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }
  }

  public getOAuth2Uri(payload: GetOAuth2UriPayload) {
    const { redirectUri } = payload;

    const { url, state, codeVerifier } = this.clientFactory().generateOAuth2AuthLink(redirectUri, {
      scope: ['users.read', 'like.read', 'tweet.read', 'offline.access'],
    });

    return {
      url,
      state,
      codeVerifier,
    };
  }

  public async loginWithOAuth2(payload: LoginWithOAuth2Payload) {
    try {
      const { accessToken, refreshToken } = await this.requestTokens(payload);

      const { data } = await this.clientFactory(accessToken).v2.me({
        "user.fields": ['description', 'profile_image_url']
      });

      await this.prismaService.twitterAuthToken.upsert({
        where: {
          twitterId: data.id,
        },
        create: {
          twitterId: data.id,
          accessToken,
          refreshToken,
        },
        update: {
          accessToken,
          refreshToken,
        },
      });

      await this.redisService.set(
        getTwitterAccountCacheKey(data.id),
        data,
        {
          expiresInSeconds: MAX_ACCOUNT_CACHE_TTL_SECONDS,
        },
      );

      return data;
    } catch (error) {
      this.logger.error({
        action: "Error occured on loginWithOAuth2 method",
        payload: {
          errorMessage: error.message,
          errorStack: error.stack,
          errorObject: {
            ...error,
          }
        }
      });

      throw new InternalServerErrorException('Something went wrong on getting info from Twitter.');
    }
  }

  private async requestTokens(payload: LoginWithOAuth2Payload) {
    const { code, codeVerifier, redirectUri } = payload;
    const { clientId, clientSecret } = this.configService.get('twitter');

    const basicToken = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const { data: { access_token, refresh_token } } = await lastValueFrom(
      this.httpService.post(
        'https://api.twitter.com/2/oauth2/token',
        {
          "grant_type": "authorization_code",
          "redirect_uri": redirectUri,
          "code_verifier": codeVerifier,
          "code": code,
        },
        {
          headers: {
            'Content-Type': "application/x-www-form-urlencoded",
            'Authorization': `Basic ${basicToken}`
          },
        }
      )
    );

    // TODO: handle errors;
    return {
      accessToken: access_token,
      refreshToken: refresh_token,
    }
  }


  private clientFactory(accessToken?: string) {
    const { clientId, clientSecret } = this.configService.get('twitter');

    if (accessToken) {
      return new TwitterApi(accessToken);
    }

    return new TwitterApi({
      clientId,
      clientSecret,
    });
  }
}
