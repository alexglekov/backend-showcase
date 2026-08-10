import { PaymentStatus } from '@prisma/client';

export interface OrderChangedPayload {
  orderChanged: {
    id: string
    status: PaymentStatus
  }
}

export abstract class PubSubService {
  abstract publishNewOrderState(payload: OrderChangedPayload): Promise<void>;
  abstract orderChanged(): AsyncIterator<OrderChangedPayload>;
}
