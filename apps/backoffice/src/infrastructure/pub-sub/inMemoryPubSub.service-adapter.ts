import { Injectable } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

import { pubSubEventsNames } from './constants';
import { OrderChangedPayload, PubSubService } from './pubSub.service-port';

@Injectable()
export class InMemoryPubSubServiceAdapter extends PubSubService {
  private pubSub: PubSub = new PubSub();

  publishNewOrderState(payload: OrderChangedPayload): Promise<void> {
    return this.pubSub.publish(pubSubEventsNames.orders.orderChanged, payload);
  }
  orderChanged(): AsyncIterator<OrderChangedPayload, any, undefined> {
    return this.pubSub.asyncIterator(pubSubEventsNames.orders.orderChanged);
  }
}
