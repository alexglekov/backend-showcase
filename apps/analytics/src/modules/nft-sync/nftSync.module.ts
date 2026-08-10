import { Module } from '@nestjs/common';

import { NftSyncService } from './services/nftSync.service';
import {
  AddBonusForReceivedNftBackgroundJob,
  AddBonusOnUserCreatedOrUpdatedBackgroundJob,
  RemoveBonusForGaveNftBackgroundJob
} from './background-jobs';

@Module({
  controllers: [
    AddBonusOnUserCreatedOrUpdatedBackgroundJob,
    AddBonusForReceivedNftBackgroundJob,
    RemoveBonusForGaveNftBackgroundJob,
  ],
  providers: [NftSyncService],
})
export class NftSyncModule {}
