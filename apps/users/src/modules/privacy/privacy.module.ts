import { Module } from '@nestjs/common';

import { PrivacyResolver } from './privacy.resolver';
import { PrivacyService } from './privacy.service';

@Module({
  imports: [],
  providers: [PrivacyService, PrivacyResolver],
  exports: [PrivacyService],
})
export class PrivacyModule {}
