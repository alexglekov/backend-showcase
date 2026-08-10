import { Module } from '@nestjs/common';

import { GamesRewardsService } from './gamesRewards.service';
import { GamesDomainEventsListener } from './gamesDomainEventsListener';

@Module({
  controllers: [
    GamesDomainEventsListener,
  ],
  providers: [
    GamesRewardsService,
  ],
})
export class GamesRewardsModule {}
