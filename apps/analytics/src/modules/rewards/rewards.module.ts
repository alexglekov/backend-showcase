import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { RewardsService } from './rewards.service';
import { RewardsResolver } from './rewards.resolver';
import { UsersDomainEventsListener } from './usersDomainEventsListener';
import { taskHandlers } from './handlers';
import { GamesDomainEventsListener } from './gamesDomainEventsListener';
import { MessengerDomainEventListener } from './messengerDomainEventsListener';
import { UpdateRewardsPlacesCronJobs } from './cron-jobs/updateRewardPlaces.cron-job';
import { RewardGraphQLEntityResolver } from './rewardGraphQLEntity.resolver';
import {
  ActivateUserChallengeTasksBackgroundJob,
  BonusForUserCompletedChallengesBackgroundJob,
  CreateUserSeasonChallengesTasksBackroundJob,
} from './background-jobs';
import { RewardsDataLoader } from './dataloaders.service';

@Module({
  imports: [
    HttpModule,
  ],
  controllers: [
    BonusForUserCompletedChallengesBackgroundJob,
    ActivateUserChallengeTasksBackgroundJob,
    CreateUserSeasonChallengesTasksBackroundJob,

    UsersDomainEventsListener,
    MessengerDomainEventListener,
    GamesDomainEventsListener,
  ],
  providers: [
    ...taskHandlers,
    RewardsService,
    RewardsDataLoader,

    RewardsResolver,
    RewardGraphQLEntityResolver,

    UpdateRewardsPlacesCronJobs,
  ],
  exports: [],
})
export class RewardsModule {}
