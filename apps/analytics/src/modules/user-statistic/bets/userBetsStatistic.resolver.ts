import { Args, Query, Resolver } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';

import { UserBetsStatisticService } from './userBetsStatistic.service';
import { GetUserBetsStatisticGraphQLInput, UserBetsStatisticGraphQLEntity } from './userBetsStatisticGraphQl.models';

@Resolver()
export class UserBetsStatisticResolver {
  constructor(private readonly userBetsStatisticService: UserBetsStatisticService) {}

  @Query(() => UserBetsStatisticGraphQLEntity)
  async getUserBetsStatistic(
    @UserCredentials() _credentials: IUserCredentials,
    @Args('data') input: GetUserBetsStatisticGraphQLInput,
  ): Promise<UserBetsStatisticGraphQLEntity> {
    const statistic = await this.userBetsStatisticService.getUserBetsStatistic(input);

    return new UserBetsStatisticGraphQLEntity(statistic);
  }
}