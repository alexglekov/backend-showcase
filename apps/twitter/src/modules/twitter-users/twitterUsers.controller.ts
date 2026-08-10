import { BadRequestException, Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  GetAccountByIdPayload,
  TwitterAccount,
} from '@xyro/contracts/twitter';

import { TwitterUsersService } from './twitterUsers.service';

@Controller()
export class TwitterUsersController {
  constructor(private readonly twitterService: TwitterUsersService) {}

  @GrpcMethod('TwitterService', 'getAccountById')
  async getAccountById(request: GetAccountByIdPayload): Promise<TwitterAccount> {
    const { twitterId } = request;
    const twitterAccount = await this.twitterService.getById(twitterId);

    if (!twitterAccount) throw new BadRequestException('Twitter not found.');

    return {
      id: twitterAccount.id,
      name: twitterAccount.name,
      username: twitterAccount.username,
      profileImageUrl: twitterAccount.profile_image_url,
      description: twitterAccount.description,
    };
  }
}
