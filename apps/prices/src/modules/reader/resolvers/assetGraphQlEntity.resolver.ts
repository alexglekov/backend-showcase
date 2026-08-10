import { Resolver, ResolveField, Parent } from '@nestjs/graphql';

import { PriceReaderService } from '../reader.service';
import { AssetGraphQLEntity } from '../types';

@Resolver(() => AssetGraphQLEntity)
export class AssetGraphQLEntityResolver {
  constructor(private readonly priceReaderService: PriceReaderService) {}

  @ResolveField(() => [Number], { name: 'last7days' })
  async last7days(@Parent() asset: AssetGraphQLEntity) {
    return this.priceReaderService.getLast7daysPrices(asset.id);
  }

  @ResolveField(() => Number, { name: 'price24h' })
  async price24h(@Parent() asset: AssetGraphQLEntity) {
    return this.priceReaderService.getAssetPrice24h(asset.id);
  }
}
