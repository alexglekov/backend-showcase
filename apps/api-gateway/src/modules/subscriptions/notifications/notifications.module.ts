import { Module } from '@nestjs/common';

import { NotificationsSubscriptionsResolver } from './notifications.subscriptions';
import { NotificationDomainEventsListener } from './notificationDomainEventsListener';

@Module({
  controllers: [
    NotificationDomainEventsListener,
  ],
  providers: [
    NotificationsSubscriptionsResolver,
  ]
})
export class NotificationsModule {}