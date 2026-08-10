import { Mutation, Resolver } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials, Void } from '@xyro/libs/graphql';

import { ReferralRewardsService } from './referralRewards.service';

@Resolver()
export class ReferralRewardsResolver {
  constructor(private readonly referralRewardsService: ReferralRewardsService) {}

  @Mutation(() => Void)
  async syncRewardsForReferrals(
    @UserCredentials() credentials: IUserCredentials,
  ) {
    const { userId } = credentials;

    await this.referralRewardsService.syncRewardsForReferrals(userId);

    return new Void();
  }
}
