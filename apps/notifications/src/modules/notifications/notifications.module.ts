import { Module } from '@nestjs/common';

import { NotificationsResolver } from './resolvers/notifications.resolver';
import { NotificationsService } from './notifications.service';

@Module({
  providers: [
    NotificationsService,
    NotificationsResolver
  ],
  exports: [
    NotificationsService,
  ]
})
export class NotificationsModule {}