import { Module } from '@nestjs/common';

import { TweetsService } from './tweets.service';
import { TweetsController } from './tweets.controller';
import { TwitterAuthModule } from '../twitter-auth/twitterAuth.module';

@Module({
  imports: [
    TwitterAuthModule,
  ],
  controllers: [
    TweetsController,
  ],
  providers: [
    TweetsService,
  ],
  exports: [
    TweetsService,
  ]
})
export class TweetsModule {}
