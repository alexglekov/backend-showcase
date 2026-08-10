import { Module } from '@nestjs/common';

import { EmailNotificationsModule } from '../email-notifications/emailNotifications.module';
import { InboundNotificationsController } from './inboundNotifications.controller';
import { InboundNotificationsService } from './inboundNotifications.service';

@Module({
  imports: [EmailNotificationsModule],
  controllers: [InboundNotificationsController],
  providers: [InboundNotificationsService],
  exports: [],
})
export class InboundNotificationsModule {}
