import { PaymentOrderUpdatedDomainEvent, PaymentOrderUpdatedDomainEventPayload } from '@xyro/contracts/users';
import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';

import { PubSubService } from '../../../infrastructure/pub-sub';
import { GraphQLFederationServerManager } from '../../../infrastructure/graphql';

@EventsListener()
export class UsersEventsObserver {
  constructor(
    private readonly pubSubService: PubSubService,
    private readonly graphQLFederationServerManager: GraphQLFederationServerManager,
  ) {}

  @SubscribeDomainEvent(PaymentOrderUpdatedDomainEvent)
  async onPaymentOrderUpdated(@EventPayload() payload: PaymentOrderUpdatedDomainEventPayload) {
    const paymentOrder = await this.graphQLFederationServerManager.getPaymentOrderById({}, payload.id);

    await this.pubSubService.publishPaymentOrderState(payload.ownerId, {
      paymentOrdersState: paymentOrder as any,
    });
  }
}
