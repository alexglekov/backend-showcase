import { Resolver, ResolveField, Parent, ResolveReference } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';
import { LoggerService } from '@xyro/libs/logger';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';
import { TwitterAccountGraphQLOrphanEntity } from '@xyro/contracts/twitter';

import {
  UserDiscordGraphQLEntity,
  UserGraphQLEntity,
  UserWalletGraphQLEntity,
} from './types/userGraphQLEntity.type';
import { UsersService } from '../services/users.service';
import { DiscordService } from '../services/discord.service';
import { UsersDataLoader } from './users.data-loader';

@Resolver(() => UserGraphQLEntity)
export class UserGraphQLEntityResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersDataLoader: UsersDataLoader,
    private readonly logger: LoggerService,
    private readonly discordService: DiscordService,
  ) {
    this.logger.setContext(UserGraphQLEntityResolver.name);
  }

  @ResolveField(() => UserDiscordGraphQLEntity, { name: 'discord', nullable: true })
  async resolveUserDiscordAccount(
    @Parent() user: UserGraphQLEntity,
    @UserCredentials(false) credentials?: IUserCredentials,
  ): Promise<UserDiscordGraphQLEntity | null> {
    if (!credentials) return null;
    if (credentials.userId !== user.id) return null;

    const { discordId } = user;

    if (!discordId) return null;

    try {
      const discordAccount = await this.discordService.getAccountById(discordId);

      return discordAccount;
    } catch (error) {
      this.logger.error({
        action: 'Error occured on getting user from discord',
        payload: {
          errorMessage: error.message,
          errorStack: error.stack,
        }
      });
      return null
    }
  }

  @ResolveField(() => TwitterAccountGraphQLOrphanEntity, { name: 'twitter', nullable: true })
  async resolveUserTwitterAccount(
    @Parent() user: UserGraphQLEntity,
    @UserCredentials(false) credentials?: IUserCredentials,
  ) {
    if (!credentials) return null;
    if (credentials.userId !== user.id) return null;

    const { twitterId } = user;

    if (!twitterId) return null;

    return new TwitterAccountGraphQLOrphanEntity({ id: twitterId });
  }

  @ResolveField(() => UserWalletGraphQLEntity, { name: 'wallet', nullable: true })
  async resolveUserWalletAccount(
    @Parent() user: UserGraphQLEntity,
    @UserCredentials(false) credentials?: IUserCredentials,
  ): Promise<UserWalletGraphQLEntity | null> {
    if (!credentials) return null;
    if (credentials.userId !== user.id) return null;

    const { walletAddress } = user;

    if (!walletAddress) return null;

    return {
      address: walletAddress,
    }
  }

  @ResolveField(() => String, { name: 'email', nullable: true })
  async resolveEmail(
    @Parent() user: UserGraphQLEntity,
    @UserCredentials(false) credentials?: IUserCredentials,
  ) {
    if (!credentials) return null;
    if (credentials.userId !== user.id) return null;
    return user.email;
  }

  @ResolveField(() => [String], { name: 'avatarUris' })
  async avatarUris(@Parent() user: UserGraphQLEntity) {
    return this.usersService.getUrisFromKeys(user.avatarKeys);
  }

  @ResolveReference()
  async resolveReference(reference: UserGraphQLOrphanEntity) {
    return this.usersDataLoader.getUserByReference(reference);
  }
}
