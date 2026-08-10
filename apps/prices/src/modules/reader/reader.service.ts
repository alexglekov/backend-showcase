import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DateTime } from 'luxon';
import { PricesCacheKeys } from '@xyro/contracts/prices';
import { LoggerService } from '@xyro/libs/logger';
import { AssetService } from '@xyro/libs/columnDb';
import { RedisService } from '@xyro/libs/redis';

import { PrismaService } from '../../infrastructure/prisma';
import { AssetId, PriceTimeData } from '../price-providers/types';
import { AssetPriceRichType, AssetPricesInput } from './types';

export type PriceMap = Record<AssetId, PriceTimeData>;

@Injectable()
export class PriceReaderService {
  constructor(
    @Inject(PrismaService) private prismaService: PrismaService,
    private readonly assetService: AssetService,
    private readonly logger: LoggerService,
    private readonly redis: RedisService
  ) {
    this.logger.setContext(PriceReaderService.name);
  }

  async listAssets() {
    return this.prismaService.asset.findMany({
      where: {
        active: true,
      },
    });
  }

  async getAssetCurrentPrice(
    assetId: string
  ): Promise<PriceTimeData | undefined> {
    const priceCache = (await this.redis.get(
      `${PricesCacheKeys.prices}:${assetId}`
    )) as PriceTimeData;

    if (priceCache) {
      return priceCache;
    }

    const priceDb = await this.assetService.findLatestPriceByAsset(assetId);
    if (!priceDb) {
      return;
    }

    return {
      assetId,
      price: priceDb.price,
      timestamp: priceDb.timestamp.valueOf(),
    };
  }

  async getAssetsWithPrice(): Promise<AssetPriceRichType[]> {
    const assets = await this.listAssets();
    const assetsIds = assets.map((asset) => asset.id);
    const priceMap = await this.getPricesMap(assetsIds);

    return assets.map(({ id, name, precision }) => {
      return {
        id,
        name,
        precision,
        price: priceMap[id]?.price,
        timestamp: priceMap[id]?.timestamp,
      };
    });
  }

  async getAssetPrices(input: AssetPricesInput) {
    if (!input.id) return;

    const assetPrices = await this.assetService.findManyByAsset(input.id, {
      limit: input.skip * input.take + input.take,
      orderBy: {
        timestamp: 'desc',
      },
    });

    return assetPrices
      .slice(input.skip * input.take, input.take)
      .map(({ price, timestamp }) => ({
        assetId: input.id,
        price,
        timestamp: timestamp.valueOf(),
      }));
  }

  async getAssetPriceAtTime(
    assetId: string,
    timestamp: number
  ): Promise<PriceTimeData | undefined> {
    try {
      const assetPrice = await this.assetService.findPriceByAssetAndTimestamp(
        assetId,
        new Date(timestamp)
      );

      return assetPrice
        ? {
            assetId,
            price: assetPrice.price,
            timestamp: assetPrice.timestamp.valueOf(),
          }
        : undefined;
    } catch (error) {
      this.logger.error(
        'Error while fetching asset price at the given timestamp',
        error
      );
      throw new InternalServerErrorException(
        'Unable to retrieve the asset price at the specified timestamp.'
      );
    }
  }

  async getAssetPricByRange(
    assetId: string,
    startDate: Date,
    endDate: Date
  ): Promise<PriceTimeData[]> {
    try {
      const prices = await this.assetService.findPricesByRange(
        assetId,
        startDate,
        endDate
      );

      return prices.map((price) => ({
        assetId: price.assetid!,
        price: price.price,
        timestamp: price.timestamp.valueOf(),
      }));
    } catch (error) {
      this.logger.error(
        'Error while fetching asset price at the given timestamp',
        error
      );
      throw new InternalServerErrorException(
        'Unable to retrieve the asset price at the specified timestamp.'
      );
    }
  }

  async getLast7daysPrices(assetId: string) {
    const prices = this.redis.get(`${PricesCacheKeys.last7days}:${assetId}`);

    return prices || [];
  }

  async calcLast7Days(assetId: string) {
    const prices: number[] = [];
    const now = DateTime.fromJSDate(new Date());

    for (let day = 6; day >= 0; day--) {
      const dayPrice = now.minus({ day });

      const priceData = await this.getAssetPriceAtTime(
        assetId,
        dayPrice.valueOf()
      );

      if (priceData) prices.push(priceData.price);
    }

    return prices;
  }

  async getAssetPrice24h(assetId: string) {
    const date = DateTime.fromJSDate(new Date()).minus({ days: 1 });

    const priceData = await this.getAssetPriceAtTime(assetId, date.valueOf());

    return priceData?.price;
  }

  private async getPricesMap(assetIds: string[]): Promise<PriceMap> {
    const prices = await Promise.all(
      assetIds.map((assetId) => this.getAssetCurrentPrice(assetId))
    );

    return prices.reduce((sum, item) => {
      if (item) sum[item?.assetId] = item;

      return sum;
    }, {} as PriceMap);
  }
}
