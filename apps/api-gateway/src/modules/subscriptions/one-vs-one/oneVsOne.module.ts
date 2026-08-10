import { Module } from '@nestjs/common';

import { OneVsOneGameSubscriptionsResolver } from './oneVsOne.subscriptions';
import { OneVsOneGameStateObserver } from './oneVsOneGameState.observer';

@Module({
  controllers: [OneVsOneGameStateObserver],
  providers: [
    OneVsOneGameSubscriptionsResolver,
  ]
})
export class OneVsOneModule {}
