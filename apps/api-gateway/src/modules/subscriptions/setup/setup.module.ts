import { Module } from '@nestjs/common';

import { SetupGameSubscriptionsResolver } from './setups.subscriptions';
import { SetupGameStateObserver } from './setupGameState.observer';

@Module({
  controllers: [SetupGameStateObserver],
  providers: [
    SetupGameSubscriptionsResolver,
  ]
})
export class SetupModule {}