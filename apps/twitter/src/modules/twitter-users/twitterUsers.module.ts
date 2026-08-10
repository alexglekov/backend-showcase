import { Module } from '@nestjs/common';

import { TwitterUsersController } from './twitterUsers.controller';
import { TwitterUsersService } from './twitterUsers.service';
import { TwitterAuthModule } from '../twitter-auth/twitterAuth.module';
import { TwitterAccountGraphQLEntityResolver } from './twitterUsers.resolver';
import { TwitterUsersDataLoader } from './twitterUsers.data-loader';

@Module({
  imports: [TwitterAuthModule],
  controllers: [TwitterUsersController],
  providers: [
    TwitterUsersService,
    TwitterUsersDataLoader,

    TwitterAccountGraphQLEntityResolver,
  ],
})
export class TwitterUsersModule {}
