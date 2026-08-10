import { BalanceSubscriber, LedgerBalanceEntity } from '@xyro/libs/ledger';
import { Injectable } from '@nestjs/common';
import { DomainEventsPublisher } from '@xyro/libs/events';
import { BalanceUpdatedDomainEvent } from '@xyro/contracts/ledger';

@Injectable()
export class EmitRefreshedBalanceService extends BalanceSubscriber {
  constructor(private readonly domainEventsPublisher: DomainEventsPublisher) {
    super()
  }

  async balanceUpdated(userId: string, balance: LedgerBalanceEntity): Promise<void> {
    return this.domainEventsPublisher.publish(
      new BalanceUpdatedDomainEvent({
        accountId: balance.accountId,
        amount: balance.amount,
        id: balance.id!,
        createdAt: balance.createdAt,
      })
    );
  }
}