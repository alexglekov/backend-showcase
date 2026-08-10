import { Resolver, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { IUserCredentials, SessionRequiredGuard, UserCredentials } from '@xyro/libs/graphql';

import { CheckNameAvailabilityInput, FindUserGraphQLInput, FindUsersInput } from './types/inputs.types';
import { UserGraphQLEntity } from './types/userGraphQLEntity.type';
import { UsersService } from '../services/users.service';

@Resolver()
export class UsersQueriesResolver {
  constructor(private usersService: UsersService) {}
  
  @Query(() => UserGraphQLEntity)
  async me(@UserCredentials() credentials: IUserCredentials) {
    const user = await this.usersService.findOneByOrThrowWithCache({ id: credentials.userId });

    return new UserGraphQLEntity(user);
  }

  @Query(() => UserGraphQLEntity, { nullable: true })
  async getUserBy(
    @Args('data') data: FindUserGraphQLInput,
  ) {
    const user = await this.usersService.findOneByOrThrowWithCache(data);

    return user ? new UserGraphQLEntity(user) : null;
  }

  @Query(() => [UserGraphQLEntity])
  @UseGuards(SessionRequiredGuard)
  async findOpponents(
    @Args('data') data: FindUsersInput,
    @UserCredentials(false) credentials?: IUserCredentials,
  ) {
    const { userId } = credentials ?? {};
    const users = await this.usersService.find1vs1Opponents({
      userId,
      ...data,
    });

    // TODO: N+1 problem
    return users.map((user) => new UserGraphQLEntity(user));
  }

  @Query(() => [UserGraphQLEntity])
  @UseGuards(SessionRequiredGuard)
  async findChatMembers(
    @Args('data') data: FindUsersInput,
  ) {
    const users = await this.usersService.findChatMembers(data);

    // TODO: N+1 problem
    return users.map((user) => new UserGraphQLEntity(user));
  }

  @Query(() => Boolean)
  async checkNameAvailability(
    @Args('data') data: CheckNameAvailabilityInput,
  ) {
    return this.usersService.checkName(data.name);
  }
}
