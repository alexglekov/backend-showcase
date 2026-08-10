import { Module } from '@nestjs/common';

import { TwitterAuthController } from './twitterAuth.controller';
import { TwitterAuthService } from './twitterAuth.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
  ],
  controllers: [TwitterAuthController],
  providers: [TwitterAuthService],
  exports: [TwitterAuthService],
})
export class TwitterAuthModule {}
