import { Module } from '@nestjs/common';

import { AddAirdropBonusBackgroundJob } from './background-jobs/addAirdropBonus.background-job';
import { AirdropRewardsService } from './airdropRewardsService';
import { AirdropRewardsController } from './airdropRewardsController';

@Module({
  controllers: [
    AddAirdropBonusBackgroundJob,
    AirdropRewardsController,
  ],
  providers: [
    AirdropRewardsService
  ]
})
export class AirdropRewardsModule {}
