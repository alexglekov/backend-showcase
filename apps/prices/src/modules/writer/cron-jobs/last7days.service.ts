import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { PricesCacheKeys } from '@xyro/contracts/prices';
import { RedisService } from '@xyro/libs/redis';
import { PriceReaderService } from '../../reader/reader.service';

@Injectable()
export class Last7DaysService implements OnModuleInit {
  constructor(
    private readonly redis: RedisService,
    @Inject(PriceReaderService)
    private priceReaderService: PriceReaderService
  ) {}

  async onModuleInit() {
    this.calcAndSaveLast7Days();
  }

  @Cron('1 0 * * * *')
  async calcAndSaveLast7Days() {
    const assets = await this.priceReaderService.listAssets();

    return Promise.all([
      assets.map(async (asset) => {
        const prices7days = await this.priceReaderService.calcLast7Days(
          asset.id
        );

        return this.redis.set(
          `${PricesCacheKeys.last7days}:${asset.id}`,
          prices7days
        );
      }),
    ]);
  }
}
