import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CountAccountTweetsAndLikesOnTweetsPayload,
  CountAccountTweetsAndLikesOnTweetsResult,
  CountLikedTweetsByAccountPayload,
  CountLikedTweetsByAccountResult,
  IsTweetRetweetedByAccountPayload,
  IsTweetRetweetedByAccountResult,
} from '@xyro/contracts/twitter';

import { TweetsService } from './tweets.service';

@Controller()
export class TweetsController {
  constructor(private readonly tweetsService: TweetsService) {}

  @GrpcMethod('TwitterService', 'isTweetRetweetedByAccount')
  async isTweetRetweetedByAccount(request: IsTweetRetweetedByAccountPayload): Promise<IsTweetRetweetedByAccountResult> {
    const { twitterId, tweetId } = request;

    const isRetweeted = await this.tweetsService.isTweetRetweetedByAccount(twitterId, tweetId);

    return {
      twitterId,
      tweetId,
      isRetweeted,
    };
  }

  @GrpcMethod('TwitterService', 'countLikedTweetsByAccount')
  async countLikedTweetsByAccount(request: CountLikedTweetsByAccountPayload): Promise<CountLikedTweetsByAccountResult> {
    const { twitterId } = request;

    const countLikedTweets = await this.tweetsService.countLikedTweetsByAccount(twitterId);

    return {
      twitterId,
      countLikedTweets,
    };
  }

  @GrpcMethod('TwitterService', 'countAccountTweetsAndLikesOnTweets')
  async countAccountTweetsAndLikesOnTweets(
    request: CountAccountTweetsAndLikesOnTweetsPayload,
  ): Promise<CountAccountTweetsAndLikesOnTweetsResult> {
    const { twitterId, mentions } = request;

    const {
      countLikesOnTweets,
      countTweets,
    } = await this.tweetsService.countAccountTweetsAndLikesOnTweets(request);

    return {
      countLikesOnTweets,
      countTweets,
    };
  }
}
