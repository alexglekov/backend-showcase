import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  GetOAuth2UriPayload,
  LoginWithOAuth2Payload,
  TwitterAccount,
  TwitterOAuth2
} from '@xyro/contracts/twitter';

import { TwitterAuthService } from './twitterAuth.service';

@Controller()
export class TwitterAuthController {
  constructor(private readonly twitterService: TwitterAuthService) {}

  @GrpcMethod('TwitterService', 'getOAuth2Uri')
  async getOAuth2Uri(request: GetOAuth2UriPayload): Promise<TwitterOAuth2> {
    return this.twitterService.getOAuth2Uri(request);
  }

  @GrpcMethod('TwitterService', 'loginWithOAuth2')
  async loginWithOAuth2(request: LoginWithOAuth2Payload): Promise<TwitterAccount> {
    const twitterAccount = await this.twitterService.loginWithOAuth2(request);

    return {
      id: twitterAccount.id,
      name: twitterAccount.name,
      username: twitterAccount.username,
      profileImageUrl: twitterAccount.profile_image_url,
      description: twitterAccount.description,
    };
  }
}