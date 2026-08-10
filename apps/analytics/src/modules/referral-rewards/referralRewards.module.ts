import { Module } from '@nestjs/common';

import { AddBonusForReferralBackgroundJob } from './background-jobs/addBonusForReferral.background-job';
import { ReferralRewardsService } from './referralRewards.service';
import { ReferralRewardsResolver } from './referralRewards.resolver';

@Module({
  controllers: [
    AddBonusForReferralBackgroundJob,
  ],
  providers: [
    ReferralRewardsResolver,
    ReferralRewardsService,
  ],
})
export class ReferralRewardsModule {}
