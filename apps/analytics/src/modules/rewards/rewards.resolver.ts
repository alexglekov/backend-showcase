import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';

import { RewardsService } from './rewards.service';
import { CheckChallengeTaskCompletionGraphQLInput, ClaimRewardGraphQLInput, RewardGraphQLEntity, SeasonGraphQLEntity } from './models';
import { UserChallengeTaskGraphQLEntity } from './models/userChallengeTaskGraphQLEntity';

@Resolver()
export class RewardsResolver {
  constructor(private readonly rewardsService: RewardsService) {}

  @Query(() => SeasonGraphQLEntity)
  public async getUserSeasonState(
    @UserCredentials() credentials: IUserCredentials,
  ) {
    const { userId } = credentials;

    const season = await this.rewardsService.getUserSeasonState({ userId });

    return new SeasonGraphQLEntity(season);
  }

  @Query(() => [RewardGraphQLEntity])
  public async getTopUsersRewards(
    @UserCredentials() credentials: IUserCredentials,
  ) {
    const { userId } = credentials;

    const rewards = await this.rewardsService.getTopUsersRewards({ userId });

    return rewards.map((reward) => new RewardGraphQLEntity(reward));
  }

  @Mutation(() => SeasonGraphQLEntity)
  public async checkChallengeTaskCompletion(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') input: CheckChallengeTaskCompletionGraphQLInput,
  ) {
    const { userId } = credentials;

    const season = await this.rewardsService.checkChallengeTaskCompletion({
      userId,
      userTaskId: input.id,
    });

    return new SeasonGraphQLEntity(season);
  }

  @Query(() => SeasonGraphQLEntity)
  public async getUserSeasonStateByUserId(
    @Args('userId') userId: string,
  ) {
    const season = await this.rewardsService.getUserSeasonState({ userId });

    return new SeasonGraphQLEntity(season);
  }

  @Query(() => RewardGraphQLEntity)
  public async getUserReward(
    @UserCredentials() credentials: IUserCredentials,
  ) {
    const { userId } = credentials;

    const reward = await this.rewardsService.getUserReward({ userId });

    return new RewardGraphQLEntity(reward);
  }

  @Mutation(() => UserChallengeTaskGraphQLEntity)
  async claimReward(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') input: ClaimRewardGraphQLInput,
  ) {
    const { userId } = credentials;

    const userChallengeTask = await this.rewardsService.claimReward({
      userId,
      userTaskId: input.id
    });

    return new UserChallengeTaskGraphQLEntity(userChallengeTask);
  }
}
