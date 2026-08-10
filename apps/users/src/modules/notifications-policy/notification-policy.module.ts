import { Module } from '@nestjs/common';

import { NotificationPolicyResolver } from './notification-policy.resolver';
import { NotificationPolicyService } from './notification-policy.service';

@Module({
  imports: [],
  providers: [NotificationPolicyResolver, NotificationPolicyService],
  exports: [NotificationPolicyService],
})
export class NotificationsPolicyModule {}
