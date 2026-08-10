import { HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@xyro/libs/logger';
import { TwitterApi, UserV2 } from 'twitter-api-v2';
import { CountAccountTweetsAndLikesOnTweetsPayload } from '@xyro/contracts/twitter';
import { TwitterAuthToken } from '@prisma/client';

import { PrismaService } from '../../infrastructure/prisma';
import { Config } from '../../infrastructure/config';
import { TwitterAuthService } from '../twitter-auth/twitterAuth.service';

@Injectable()
export class TweetsService {
  constructor(
    private readonly logger: LoggerService,
    private readonly prismaService: PrismaService,
    private readonly twitterAuthService: TwitterAuthService,
    private readonly configService: ConfigService<Config>,
  ) {
    this.logger.setContext(TweetsService.name);
  }

  async countAccountTweetsAndLikesOnTweets(payload: CountAccountTweetsAndLikesOnTweetsPayload) {
    const { twitterId, mentions } = payload;
    const twitterAccount = await this.prismaService.twitterAuthToken.findFirstOrThrow({ where: { twitterId } });

    const query = `from:${twitterId} ${['', mentions].join(' @')}`;

    let untilId: string | undefined = undefined;

    let countLikesOnTweets = 0;
    let countTweets = 0;

    do {
      const { meta, tweets } = await this.searchByUserToken(twitterAccount, query, undefined, untilId);

      if (meta.result_count === 0) break;

      countTweets += tweets.length;
      for (const tweet of tweets) {
        countLikesOnTweets += tweet.public_metrics?.like_count || 0;
      }

      untilId = meta.oldest_id;
    } while (untilId);

    return {
      countLikesOnTweets,
      countTweets,
    }
  }

  async searchByUserToken(twitterAccount: TwitterAuthToken, query: string, sinceId?: string, untilId?: string) {
    try {
      const { data, meta } = await this.clientFactory(twitterAccount.accessToken).v2.search({
        query,
        "expansions": ['attachments.media_keys'],
        "tweet.fields": ['created_at', 'public_metrics', 'non_public_metrics'],
        since_id: sinceId || undefined,
        until_id: untilId || undefined,
      });

      return { meta, tweets: data.data ?? [] }
    } catch (error) {
      if (error.code !== HttpStatus.UNAUTHORIZED || !twitterAccount.refreshToken) {
        throw new InternalServerErrorException('Internal server error.');
      }
      const newTokens = await this.twitterAuthService.refreshTokens(twitterAccount.twitterId, twitterAccount.refreshToken);
      const { data, meta } = await this.clientFactory(newTokens.accessToken).v2.search({
        query,
        "expansions": ['attachments.media_keys'],
        "tweet.fields": ['created_at', 'public_metrics', 'non_public_metrics'],
        since_id: sinceId || undefined,
      });
      return { meta, tweets: data.data ?? [] }
    }
  }

  async isTweetRetweetedByAccount(twitterId: string, tweetId: string): Promise<boolean> {
    const countRetweeted = await this.prismaService.retweet.count({
      where: {
        tweetId,
        twitterId,
      }
    });

    return countRetweeted > 0;
  }

  async countLikedTweetsByAccount(twitterId: string): Promise<number> {
    return this.prismaService.tweetLike.count({
      where: {
        twitterId,
      },
    });
  }

  async tweetLikedBy(twitterId: string, tweetId: string, paginationToken?: string) {
    const twitterAccount = await this.prismaService.twitterAuthToken.findFirstOrThrow({ where: { twitterId } });
    try {
      const { data, meta } = await this.clientFactory(twitterAccount.accessToken).get(
        `https://api.twitter.com/2/tweets/${tweetId}/liking_users`,
        {
          pagination_token: paginationToken,
        }
      );

      return {
        meta: meta as {
          result_count: number;
          previous_token?: string | undefined;
          next_token?: string | undefined;
        },
        twitterAccounts: data as UserV2[] | undefined,
      }
    } catch (error) {
      if (error.code !== HttpStatus.UNAUTHORIZED || !twitterAccount.refreshToken) {
        throw new InternalServerErrorException('Internal server error.');
      }
      const newTokens = await this.twitterAuthService.refreshTokens(twitterId, twitterAccount.refreshToken);
      const { data, meta } = await this.clientFactory(newTokens.accessToken).get(
        `https://api.twitter.com/2/tweets/${tweetId}/liking_users`,
        {
          pagination_token: paginationToken,
        }
      );

      return {
        meta: meta as {
          result_count: number;
          previous_token?: string | undefined;
          next_token?: string | undefined;
        },
        twitterAccounts: data as UserV2[] | undefined,
      }
    }
  }

  async searchByAppToken(query: string, sinceId?: string) {
    const { data, meta } = await this.clientFactory().v2.search({
      query,
      "tweet.fields": ['created_at'],
      since_id: sinceId || undefined,
    });

    return { meta, tweets: data.data }
  }

  async tweetRetweetedBy(twitterId: string, tweetId: string, paginationToken?: string) {
    const twitterAccount = await this.prismaService.twitterAuthToken.findFirstOrThrow({ where: { twitterId } });

    try {
      const { data, meta } = await this.clientFactory(twitterAccount.accessToken).get(
        `https://api.twitter.com/2/tweets/${tweetId}/retweeted_by`,
        {
          pagination_token: paginationToken,
        }
      );

      return {
        meta: meta as {
          result_count: number;
          previous_token?: string | undefined;
          next_token?: string | undefined;
        },
        twitterAccounts: data as UserV2[] | undefined,
      }
    } catch (error) {
      if (error.code !== HttpStatus.UNAUTHORIZED || !twitterAccount.refreshToken) {
        throw new InternalServerErrorException('Internal server error.');
      }
      const newTokens = await this.twitterAuthService.refreshTokens(twitterId, twitterAccount.refreshToken);
      const { data, meta } = await this.clientFactory(newTokens.accessToken).get(
        `https://api.twitter.com/2/tweets/${tweetId}/retweeted_by`,
        {
          pagination_token: paginationToken,
        }
      );

      return {
        meta: meta as {
          result_count: number;
          previous_token?: string | undefined;
          next_token?: string | undefined;
        },
        twitterAccounts: data as UserV2[] | undefined,
      }
    }
  }

  private clientFactory(accessToken?: string) {
    if (accessToken) {
      return new TwitterApi(accessToken);
    }
    const { bearerToken } = this.configService.get('twitter');
    return new TwitterApi(bearerToken);
  }
}
