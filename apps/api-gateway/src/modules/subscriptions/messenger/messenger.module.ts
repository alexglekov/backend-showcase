import { Module } from '@nestjs/common';

import { MessengerDomainEventsListener } from './messenger.observer';
import { MessengerSubscriptionsResolver } from './messenger.subscriptions';

@Module({
  controllers: [
    MessengerDomainEventsListener
  ],
  providers: [MessengerSubscriptionsResolver],
})
export class MessengerModule {}
