import { Args, Resolver, Subscription } from '@nestjs/graphql';
import { AssetPriceGraphQLOrphanEntity } from '@xyro/contracts/prices';

import { AssetPriceChangedPayload, PubSubService } from '../../../infrastructure/pub-sub';

@Resolver()
export class PricesSubscriptionsResolver {
  constructor(private readonly pubSubService: PubSubService) {}

  @Subscription(() => AssetPriceGraphQLOrphanEntity)
  assetPriceChanged(@Args('assetId') assetId: string): AsyncIterator<AssetPriceChangedPayload> {
    return this.pubSubService.assetPriceChanged(assetId);
  }
}
