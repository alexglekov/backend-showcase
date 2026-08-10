import { Module } from '@nestjs/common';

import { AnalyticsSubscriptionsResolver } from './analytics.subscriptions';
import { AnalyticsObserver } from './analytics.observer';

@Module({
  controllers: [
    AnalyticsObserver
  ],
  providers: [
    AnalyticsSubscriptionsResolver,
  ]
})
export class AnalyticsModule {}
