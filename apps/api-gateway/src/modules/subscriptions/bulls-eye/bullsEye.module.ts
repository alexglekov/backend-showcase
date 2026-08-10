import { Module } from '@nestjs/common';

import { BullsEyeGameSubscriptionsResolver } from './bullsEye.subscriptions';
import { BullsEyeDomainEventsListener } from './bullsEyeDomainEventsListener.';

@Module({
  controllers: [
    BullsEyeDomainEventsListener
  ],
  providers: [
    BullsEyeGameSubscriptionsResolver,
  ]
})
export class BullsEyeModule {}
