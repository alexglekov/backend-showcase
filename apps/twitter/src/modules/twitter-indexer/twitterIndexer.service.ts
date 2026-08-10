import { Injectable } from '@nestjs/common';
import {
  SyncUserLikesTaskEvent,
  SyncUserLikesTaskEventPayload,
  SyncUserRetweetsTaskEvent,
  SyncUserRetweetsTaskEventPayload
} from '@xyro/contracts/twitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DomainEventsPublisher } from '@xyro/libs/events';
import { LoggerService } from '@xyro/libs/logger';
import { isString } from 'lodash';

import { PrismaService } from '../../infrastructure/prisma';
import { TweetsService } from '../tweets/tweets.service';
import { PLATFORM_TWITTER_NAME } from '../../infrastructure/constants';

const LIKES_OFFSET_TYPE = 'likes';
const RETWEETS_OFFSET_TYPE = 'retweets';

@Injectable()
export class TwitterIndexerService {
  constructor(
    private readonly logger: LoggerService,
    private readonly domainEventsPublisher: DomainEventsPublisher,
    private readonly prismaService: PrismaService,
    private readonly tweetsService: TweetsService,
  ) {
    this.logger.setContext(TwitterIndexerService.name);
  }

  @Cron("0 */15 * * * *")
  async scheduleTasks() {
    let tweetsSkip = 0;
    let usersSkip = 0;
    const take = 100;

    let twitterAccounts;
    do {
      twitterAccounts = await this.prismaService.twitterAuthToken.findMany({
        select: { twitterId: true },
        skip: usersSkip,
        take
      });
      usersSkip += take;

      let tweets = await this.prismaService.tweet.findMany({
        select: { tweetId: true },
        skip: tweetsSkip,
        take
      });

      const mappedTwitterAccounts = [...twitterAccounts];
      while (mappedTwitterAccounts.length !== 0 && tweets.length !== 0) {
        const user = mappedTwitterAccounts.pop();
        if (!user) break;

        const splicedTweets = tweets.splice(0, 5);

        for (const tweet of splicedTweets) {
          await this.domainEventsPublisher.publish(new SyncUserLikesTaskEvent({
            tweetId: tweet.tweetId,
            twitterId: user.twitterId,
          }));
          await this.domainEventsPublisher.publish(new SyncUserRetweetsTaskEvent({
            tweetId: tweet.tweetId,
            twitterId: user.twitterId,
          }));
        }

        if (tweets.length === 0) {
          tweetsSkip += take;
          tweets = await this.prismaService.tweet.findMany({
            select: { tweetId: true },
            skip: tweetsSkip,
            take
          });
        }
        if (tweets.length === 0) {
          tweetsSkip = 0;
          tweets = await this.prismaService.tweet.findMany({
            select: { tweetId: true },
            skip: tweetsSkip,
            take
          });
        }
      }
    } while (twitterAccounts.length !== 0);
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async syncTweets() {
    try {
      const lastTweet = await this.prismaService.tweet.findFirst({
        take: 1,
        orderBy: {
          createdAt: 'desc',
        }
      });

      const { tweets } = await this.tweetsService.searchByAppToken(
        `from:${PLATFORM_TWITTER_NAME} -is:retweet -is:reply -is:quote`,
        lastTweet?.tweetId
      );

      this.logger.log({
        action: 'Searched tweets',
        payload: {
          tweetSinceId: lastTweet?.tweetId,
          tweetsIds: tweets?.map((tweet) => tweet.id) ?? [],
        }
      });

      if (!tweets || tweets.length === 0) return;

      await Promise.all(
        tweets.map((tweet) => this.prismaService.tweet.upsert({
          where: {
            tweetId: tweet.id,
          },
          create: {
            tweetId: tweet.id,
            createdAt: tweet.created_at ? new Date(tweet.created_at) : new Date(),
            text: tweet.text,
          },
          update: {},
        }))
      );
    } catch (error) {
      this.logger.error({
        action: 'Error on handling SyncTweetsTaskEvent Event',
        payload: {
          errorMessage: error.message,
          errorStack: error.stack,
        }
      });
    }
  }

  async onSyncUserLikesTaskEvent(payload: SyncUserLikesTaskEventPayload) {
    try {
      const { twitterId, tweetId } = payload;

      const offset = await this.prismaService.twitterOffset.upsert({
        where: { tweetId_type: { tweetId, type: LIKES_OFFSET_TYPE } },
        create: { tweetId, type: LIKES_OFFSET_TYPE },
        update: {}
      });

      const { twitterAccounts, meta } = await this.tweetsService.tweetLikedBy(twitterId, tweetId, offset.nextToken || undefined);

      this.logger.log({
        action: 'Searched likes',
        payload: {
          twitterId,
          tweetId,
          likesAmount: twitterAccounts?.length || 0,
        }
      });

      if (
        !twitterAccounts
        || twitterAccounts.length === 0
        || isString(meta.next_token) && meta.next_token === offset.endToken
      ) {
        await this.prismaService.twitterOffset.update({
          where: {
            tweetId_type: { tweetId, type: LIKES_OFFSET_TYPE },
          },
          data: {
            nextToken: null,
            startToken: null,
            endToken: offset.startToken,
          },
        });
        return;
      }

      await this.prismaService.$transaction(async (transaction) => {
        await transaction.tweetLike.createMany({
          data: twitterAccounts.map((twitterAccount) => ({
            tweetId,
            twitterId: twitterAccount.id,
          })),
          skipDuplicates: true,
        });

        await transaction.twitterOffset.update({
          where: {
            tweetId_type: { tweetId, type: LIKES_OFFSET_TYPE }
          },
          data: {
            nextToken: meta.next_token,
            startToken: !offset.startToken ? meta.next_token : undefined,
          }
        });
      });
    } catch (error) {
      this.logger.error({
        action: 'Error on handling SyncUserLikesTask Event',
        payload: {
          errorMessage: error.message,
          errorStack: error.stack,
          errorCode: error.code,
        }
      });
    }
  }

  async onSyncUserRetweetsTaskEvent(payload: SyncUserRetweetsTaskEventPayload) {
    try {
      const { twitterId, tweetId } = payload;

      const offset = await this.prismaService.twitterOffset.upsert({
        where: { tweetId_type: { tweetId, type: RETWEETS_OFFSET_TYPE } },
        create: { tweetId, type: RETWEETS_OFFSET_TYPE },
        update: {}
      });

      const { twitterAccounts, meta } = await this.tweetsService.tweetRetweetedBy(twitterId, tweetId, offset.nextToken || undefined);

      this.logger.log({
        action: 'Searched retweets',
        payload: {
          twitterId,
          tweetId,
          likesAmount: twitterAccounts?.length || 0,
        }
      });

      if (
        !twitterAccounts
        || twitterAccounts.length === 0
        || isString(meta.next_token) && meta.next_token === offset.endToken
      ) {
        await this.prismaService.twitterOffset.update({
          where: {
            tweetId_type: { tweetId, type: RETWEETS_OFFSET_TYPE },
          },
          data: {
            nextToken: null,
            startToken: null,
            endToken: offset.startToken,
          },
        });
        return;
      }

      await this.prismaService.$transaction(async (transaction) => {
        await transaction.retweet.createMany({
          data: twitterAccounts.map((twitterAccount) => ({
            tweetId,
            twitterId: twitterAccount.id,
            withQuote: false,
          })),
          skipDuplicates: true,
        });

        await transaction.twitterOffset.update({
          where: {
            tweetId_type: { tweetId, type: RETWEETS_OFFSET_TYPE }
          },
          data: {
            nextToken: meta.next_token,
            startToken: !offset.startToken ? meta.next_token : undefined,
          }
        });
      });
    } catch (error) {
      this.logger.error({
        action: 'Error on handling SyncUserRetweetsTask Event',
        payload: {
          errorMessage: error.message,
          errorStack: error.stack,
          errorCode: error.code,
        }
      });
    }
  }
}
