import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { LoggerService } from '@xyro/libs/logger';
import { RedisService } from '@xyro/libs/redis';
import { TwitterApi, UserV2 } from 'twitter-api-v2';
import {
  getTwitterAccountCacheKey
} from '@xyro/contracts/twitter';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../infrastructure/prisma';
import { MAX_ACCOUNT_CACHE_TTL_SECONDS } from '../../infrastructure/constants';
import { TwitterAuthService } from '../twitter-auth/twitterAuth.service';
import { Config } from '../../infrastructure/config';

@Injectable()
export class TwitterUsersService {
  constructor(
    private readonly logger: LoggerService,
    private readonly redisService: RedisService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService<Config>,
    private readonly twitterAuthService: TwitterAuthService,
  ) {
    this.logger.setContext(TwitterUsersService.name);
  }

  async getManyByIds(twitterIds: string[]) {
    const usersCaches = await this.redisService.getBatch<UserV2>(twitterIds.map((id) => getTwitterAccountCacheKey(id)));

    const notCachedAccounts = twitterIds.filter((_, index) => !usersCaches[index]);

    if (notCachedAccounts.length === 0) return usersCaches;

    const { data: twitterAccounts, } = await this.clientFactory().v2.users(notCachedAccounts, {
      "user.fields": ['description', 'profile_image_url'],
    });

    await Promise.allSettled(
      twitterAccounts.map((twitterAccount) => this.redisService.set(
        getTwitterAccountCacheKey(twitterAccount.id), twitterAccount, { expiresInSeconds: MAX_ACCOUNT_CACHE_TTL_SECONDS })
      )
    );

    return usersCaches.concat(twitterAccounts);
  }

  async getById(twitterId: string): Promise<UserV2> {
    const cachedValue = await this.redisService.get<UserV2>(getTwitterAccountCacheKey(twitterId));
    if (cachedValue) return cachedValue;

    const twitterTokens = await this.prismaService.twitterAuthToken.findFirst({ where: { twitterId } });

    if (!twitterTokens) throw new BadRequestException('Twitter not found.');

    let twitterAccount: UserV2;

    try {
      const { data } = await this.clientFactory(twitterTokens.accessToken).v2.user(twitterId, {
        "user.fields": ['description', 'profile_image_url'],
      });

      twitterAccount = data;
    } catch (error) {
      if (error.code !== HttpStatus.UNAUTHORIZED || !twitterTokens.refreshToken) {
        throw new BadRequestException('Internal server error.');
      }

      const newTokens = await this.twitterAuthService.refreshTokens(twitterId, twitterTokens.refreshToken);
      const { data } = await this.clientFactory(newTokens.accessToken).v2.user(twitterId, {
        "user.fields": ['description', 'profile_image_url'],
      });

      twitterAccount = data;
    }

    await this.redisService.set(
      getTwitterAccountCacheKey(twitterId),
      twitterAccount,
      {
        expiresInSeconds: MAX_ACCOUNT_CACHE_TTL_SECONDS,
      }
    );
    
    return twitterAccount;
  }

  private clientFactory(accessToken?: string) {
    if (accessToken) {
      return new TwitterApi(accessToken);
    }
    const { bearerToken } = this.configService.get('twitter');
    return new TwitterApi(bearerToken);
  }
}
