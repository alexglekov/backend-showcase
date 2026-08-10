import { Module } from '@nestjs/common';

import { LedgerDomainEventsListener } from './ledgerDomainEventsListener';
import { LedgerEventsSubscriptionsResolver } from './ledger.subscriptions';

@Module({
  controllers: [
    LedgerDomainEventsListener,
  ],
  providers: [LedgerEventsSubscriptionsResolver],
})
export class LedgerEventsModule {}
