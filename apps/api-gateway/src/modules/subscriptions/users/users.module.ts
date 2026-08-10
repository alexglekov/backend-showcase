import { Global, Module } from '@nestjs/common';

import { UsersSubscriptionsResolver } from './users.subscriptions';
import { UsersEventsObserver } from './users.observer';

@Module({
  controllers: [
    UsersEventsObserver,
  ],
  providers: [
    UsersSubscriptionsResolver,
  ],
})
export class UsersModule {}