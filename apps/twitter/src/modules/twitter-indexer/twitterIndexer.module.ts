import { Module } from '@nestjs/common';

import { TwitterIndexerTaskEventsListener } from './twitterIndexer.controller';
import { TwitterIndexerService } from './twitterIndexer.service';
import { TweetsModule } from '../tweets/tweets.module';

@Module({
  imports: [
    TweetsModule,
  ],
  controllers: [
    TwitterIndexerTaskEventsListener,
  ],
  providers: [
    TwitterIndexerService,
  ],
  exports: [],
})
export class TwitterIndexerModule {}
