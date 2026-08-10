import { Resolver, Subscription } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';
import { BalanceGraphQLOrphanEntity, LedgerService } from '@xyro/contracts/ledger';
import { Inject } from '@nestjs/common';
import { AppsNames } from '@xyro/core';
import { lastValueFrom } from 'rxjs';

import { PubSubService, BalanceUpdatedStatePayload } from '../../../infrastructure/pub-sub';

@Resolver()
export class LedgerEventsSubscriptionsResolver {
  constructor(
    @Inject(AppsNames.Ledger) private readonly ledgerService: LedgerService,
    private readonly pubSubService: PubSubService,
  ) {}

  @Subscription(() => BalanceGraphQLOrphanEntity)
  async updatedBalance(@UserCredentials() credentials: IUserCredentials): Promise<AsyncIterator<BalanceUpdatedStatePayload>> {
    const { userId } = credentials;

    const account = await lastValueFrom(this.ledgerService.getUserLedgerAccount({ userId }));

    return this.pubSubService.updatedBalance(account.id);
  }
}
