import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';
import { PaymentTransaction } from '@prisma/client';

import { PaymentTransactionEntity } from '../entities';

export class PaymentTransactionUpdatedDomainEventPayload extends PaymentTransactionEntity implements BaseEventPayload {
  toJSON() {
    return Object.assign({}, this);
  };
}

export class PaymentTransactionUpdatedDomainEvent extends BaseEvent<PaymentTransactionUpdatedDomainEventPayload> {
  override eventClass = PaymentTransactionUpdatedDomainEvent;

  public static override topic: string = 'payment-transaction-updated';
  public override payload: PaymentTransactionUpdatedDomainEventPayload;

  constructor(paymentTransaction: PaymentTransaction) {
    super();

    this.payload = new PaymentTransactionUpdatedDomainEventPayload(paymentTransaction);
  }
}
