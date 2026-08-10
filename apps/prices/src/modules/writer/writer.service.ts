import { Injectable } from '@nestjs/common';

import { PricesCacheKeys } from '@xyro/contracts/prices';
import { RedisService } from '@xyro/libs/redis';
import { AssetService } from '@xyro/libs/columnDb';

import { PriceTimeData } from '../price-providers/types';

const PRICE_EXPIRED = 5;

@Injectable()
export class PricesWriterService {
  constructor(
    private readonly redis: RedisService,
    private readonly assetService: AssetService
  ) {}

  savePricesToCache(prices: PriceTimeData[]) {
    return Promise.all(
      prices.map(({ price, assetId, timestamp }) => {
        return this.redis.set(
          `${PricesCacheKeys.prices}:${assetId}`,
          {
            assetId,
            price,
            timestamp,
          },
          {
            expiresInSeconds: PRICE_EXPIRED,
          }
        );
      })
    );
  }

  savePricesToDb(prices: PriceTimeData[]) {
    return this.assetService.insertBatch(
      prices.map(({ price, assetId, timestamp }) => ({
        asset: assetId,
        price,
        timestamp: new Date(timestamp),
      }))
    );
  }
}
