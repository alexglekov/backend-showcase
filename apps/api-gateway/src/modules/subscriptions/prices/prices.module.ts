import { Module } from '@nestjs/common';

import { PricesSubscriptionsResolver } from './prices.subscriptions';
import { AssetPriceChangedObserver } from './assetPriceChanged.observer';

@Module({
  controllers: [AssetPriceChangedObserver],
  providers: [PricesSubscriptionsResolver],
})
export class PricesModule {}