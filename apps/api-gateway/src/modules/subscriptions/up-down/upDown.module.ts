import { Module } from '@nestjs/common';

import { UpDownGameSubscriptionsResolver } from './upDown.subscriptions';
import { UpDownDomainEventsListener } from './upDownDomainEventsListener.';

@Module({
  controllers: [
    UpDownDomainEventsListener
  ],
  providers: [
    UpDownGameSubscriptionsResolver,
  ]
})
export class UpDownModule {}
