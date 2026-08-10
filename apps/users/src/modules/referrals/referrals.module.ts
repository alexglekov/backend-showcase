import { Module } from '@nestjs/common';

import { ReferralsService } from './referrals.service';
import { ReferralsResolver } from './referrals.resolver';
import { UsersModule } from '../users';
import { ReferralsController } from './referrals.controller';

@Module({
  imports: [
    UsersModule,
  ],
  controllers: [
    ReferralsController,
  ],
  providers: [
    ReferralsService,
    ReferralsResolver,
  ],
  exports: [
    ReferralsService,
  ],
})
export class ReferralsModule {}
