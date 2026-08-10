import { Query, Resolver, Subscription } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';
import { PaymentOrderGraphQLOrphanEntity } from '@xyro/contracts/users';

import { GlobalPubSubService, PaymentOrderStatePayload, PubSubService } from '../../../infrastructure/pub-sub';
import { OnlineCounterService } from '../../online-counter';

@Resolver()
export class UsersSubscriptionsResolver {
  constructor(
    private readonly pubSubService: PubSubService,
    private readonly globalPubSubService: GlobalPubSubService,
    private readonly onlineCounterService: OnlineCounterService,
  ) {}

  @Subscription(() => PaymentOrderGraphQLOrphanEntity)
  paymentOrdersState(
    @UserCredentials() credentials: IUserCredentials
  ): AsyncIterator<PaymentOrderStatePayload> {
    const { userId } = credentials;

    return this.pubSubService.paymentOrdersState(userId);
  }

  @Subscription(() => Number)
  online() {
    return this.globalPubSubService.online();
  }

  @Query(() => Number)
  getCurrentOnline() {
    return this.onlineCounterService.getOnlineCount();
  }
}
