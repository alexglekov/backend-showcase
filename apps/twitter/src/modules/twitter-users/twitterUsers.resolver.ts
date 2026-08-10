import { Query, ResolveReference, Resolver } from '@nestjs/graphql';
import { TwitterAccountGraphQLOrphanEntity } from '@xyro/contracts/twitter';
import { BadRequestException } from '@nestjs/common';

import { TwitterAccountGraphQLEntity } from './twitterAccountGraphQLEntity';
import { TwitterUsersDataLoader } from './twitterUsers.data-loader';

@Resolver(() => TwitterAccountGraphQLEntity)
export class TwitterAccountGraphQLEntityResolver {
  constructor(private readonly twitterUsersDataLoader: TwitterUsersDataLoader) {}

  @Query(() => TwitterAccountGraphQLEntity)
  async getTwitterAccountById() {
    // Заглушка, чтобы TwitterAccountGraphQLEntity появился на схеме
    throw new BadRequestException('Twitter Account not found');
  }

  @ResolveReference()
  resolveReference(reference: TwitterAccountGraphQLOrphanEntity) {
    return this.twitterUsersDataLoader.getAccountByReference(reference);
  }
}
