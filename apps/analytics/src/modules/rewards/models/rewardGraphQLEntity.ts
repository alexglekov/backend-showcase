import { Directive, Field, Int, ObjectType } from '@nestjs/graphql';
import { RewardEntity } from '@xyro/contracts/analytics';
import { GraphQLEntitiesNames } from '@xyro/core';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';

import { RewardWithBalance } from '../typings';

@ObjectType(GraphQLEntitiesNames.Reward)
@Directive('@key(fields: "id")')
export class RewardGraphQLEntity extends RewardEntity {
  @Field(() => Number)
  public readonly totalScore: number;

  @Field(() => UserGraphQLOrphanEntity, { nullable: true })
  public readonly user: UserGraphQLOrphanEntity;

  @Field(() => Int, { nullable: true })
  public placeChange?: number;

  @Field(() => Number)
  public rewardsForChallenges!: number;
  
  @Field(() => Int)
  public lastPlaceOnLeaderboard: number;

  constructor(reward: RewardWithBalance) {
    super(reward);
    this.totalScore = Number(reward.balance?.amount || 0);

    this.rewardsForChallenges = (this.rewards || 0) - (this.referralRewards || 0);

    if (reward.lastPlace && reward.currentPlace) {
      this.placeChange = Number(reward.lastPlace) - Number(reward.currentPlace);
    }
  }
}
