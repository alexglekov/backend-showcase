import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';
import { PaymentOrder } from '@prisma/client';

import { PaymentOrderEntity } from '../entities';

export class PaymentOrderUpdatedDomainEventPayload extends PaymentOrderEntity implements BaseEventPayload {
  toJSON() {
    return Object.assign({}, this);
  };
}

export class PaymentOrderUpdatedDomainEvent extends BaseEvent<PaymentOrderUpdatedDomainEventPayload> {
  override eventClass = PaymentOrderUpdatedDomainEvent;

  public static override topic: string = 'payment-order-updated';
  public override payload: PaymentOrderUpdatedDomainEventPayload;

  constructor(paymentOrder: PaymentOrder) {
    super();

    this.payload = new PaymentOrderUpdatedDomainEventPayload(paymentOrder);
  }
}
