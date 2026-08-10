import { Query, Resolver } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';

import { BackofficeUserGraphQLEntity } from '../models/userGraphqlEntity.model';
import { BackofficeUsersService } from '../backofficeUsers.service';

@Resolver()
export class BackofficeUsersResolver {
  constructor(private readonly backofficeUsersService: BackofficeUsersService) {}

  @Query(() => BackofficeUserGraphQLEntity)
  async me(
    @UserCredentials() credentials: IUserCredentials
  ) {
    const { userId } = credentials;

    return this.backofficeUsersService.findByIdOrThrow(userId);
  }
}