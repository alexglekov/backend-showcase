import { Resolver, Query, Args } from '@nestjs/graphql';

import { Inject } from '@nestjs/common';
import { PriceReaderService } from '../reader.service';
import {
  AssetGraphQLEntity,
  AssetPriceGraphQLEntity,
  AssetPricesInput,
  AssetPricesRangeInput,
} from '../types';

@Resolver()
export class PricesReaderResolver {
  constructor(
    @Inject(PriceReaderService) private pricesReaderService: PriceReaderService
  ) {}

  @Query(() => [AssetGraphQLEntity])
  async listAssets() {
    const assets = await this.pricesReaderService.getAssetsWithPrice();
    return assets.map((asset) => new AssetGraphQLEntity(asset));
  }

  @Query(() => [AssetPriceGraphQLEntity])
  async assetPrices(@Args('data') data: AssetPricesInput) {
    return this.pricesReaderService.getAssetPrices(data);
  }

  @Query(() => [AssetPriceGraphQLEntity])
  async priceRange(@Args('data') data: AssetPricesRangeInput) {
    const { assetId, startDate, endDate } = data;
    return this.pricesReaderService.getAssetPricByRange(
      assetId,
      startDate,
      endDate
    );
  }
}
