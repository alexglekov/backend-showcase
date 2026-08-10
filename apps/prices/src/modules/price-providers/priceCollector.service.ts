import { Injectable } from '@nestjs/common';
import { LoggerService } from '@xyro/libs/logger';

import { HeapType, PriceTimeData, PricesType, SpreadsType } from './types';
import { Source } from './entities/Source';
import { RedisService } from '@xyro/libs/redis';
import { PricesPidCacheKeys } from '@xyro/contracts/prices';
import { AssetKoefMap } from './modules/pid/pid.types';

const SPREAD_TRESHOLD = 0.05;
const PRICES_COUNT_TRESHOLD = 3;

@Injectable()
export class PriceCollectorService {
  heap: HeapType = {};
  prevPrices?: PricesType;

  constructor(
    private readonly logger: LoggerService,
    private readonly redis: RedisService
  ) {
    this.logger.setContext(PriceCollectorService.name);
  }

  addPrice(assetId: string, source: Source, price: number) {
    if (!this.heap[assetId]) {
      this.heap[assetId] = {};
    }
    if (!this.heap[assetId][source.id]) {
      this.heap[assetId][source.id] = { sum: 0, count: 0 };
    }
    this.heap[assetId][source.id].sum += price;
    this.heap[assetId][source.id].count++;
  }

  async fetchLastPrice(): Promise<PriceTimeData[]> {
    const prices = await this.extractPrices();
    const date = new Date();

    const arrayPrices = Object.keys(prices).map((assetId) => ({
      assetId,
      price: prices[assetId],
      timestamp: date.valueOf(),
    }));

    return arrayPrices;
  }

  private async extractPrices() {
    const assetKoefMap =
      (await this.redis.get<AssetKoefMap>(PricesPidCacheKeys.assetKoef)) || {};

    const spreads = this.calcSpreads(assetKoefMap);
    const prices = this.clearPrices(assetKoefMap, spreads);

    this.heap = {};
    this.prevPrices = prices;

    return prices;
  }

  private getPricesFromHeap(assetKoefMap: AssetKoefMap): PricesType {
    let prices: PricesType = {};

    Object.keys(this.heap).forEach((assetId) => {
      let wSum = 0;
      let weight = 0;
      Object.keys(this.heap[assetId]).forEach((source) => {
        const assetKoef = assetKoefMap[assetId]?.k;

        const w = this.weight(assetKoef, assetId, source);
        const { sum, count } = this.heap[assetId][source];
        wSum += (sum / count) * w;
        weight += w;
      });
      if (weight) {
        prices[assetId] = wSum / weight;
      }
    });

    return prices;
  }

  private clearPrices(
    assetKoefMap: AssetKoefMap,
    spreads: SpreadsType
  ): PricesType {
    let prices: PricesType = {};
    const counters: Record<string, number> = {};

    Object.keys(this.heap).forEach((assetId) => {
      let wSum = 0;
      let weight = 0;
      counters[assetId] = 0;

      Object.keys(this.heap[assetId]).forEach((source) => {
        const assetKoef = assetKoefMap[assetId]?.k;

        const w = this.weight(assetKoef, assetId, source);
        const { sum, count } = this.heap[assetId][source];
        const { spread, spreadPreviousPrice } = spreads[assetId][source];

        counters[assetId] += count;

        if (spread > SPREAD_TRESHOLD) {
          // this.logger.log('skipped', `${assetId}-${source}`, spread * 100);
          return;
        }
        if (spreadPreviousPrice > SPREAD_TRESHOLD) {
          this.logger.log(`previous warn ${assetId}-${source} ${spreadPreviousPrice * 100}`); // in percents
        }
        wSum += (sum / count) * w;
        weight += w;
      });
      if (weight) {
        prices[assetId] = wSum / weight;
      }

      if (counters[assetId] < PRICES_COUNT_TRESHOLD) {
        this.logger.log(`FEW sources: ${assetId}=${counters[assetId]}`);
      }
    });

    return prices;
  }

  private calcSpreads(assetKoefMap: AssetKoefMap): SpreadsType {
    const prices: PricesType = this.getPricesFromHeap(assetKoefMap);
    const spreads: SpreadsType = {};

    const prev = this.prevPrices ? this.prevPrices : prices;

    Object.keys(this.heap).forEach((assetId) => {
      Object.keys(this.heap[assetId]).forEach((source) => {
        const assetKoef = assetKoefMap[assetId]?.k;

        const w = this.weight(assetKoef, assetId, source);
        const { sum, count } = this.heap[assetId][source];
        const price = (sum / count) * w;

        if (!spreads[assetId]) spreads[assetId] = {};

        spreads[assetId][source] = {
          spread: Math.abs(price - prices[assetId]) / prices[assetId],
          spreadPreviousPrice: Math.abs(price - prev[assetId]) / prev[assetId],
        };
      });
    });

    return spreads;
  }

  private weight(assetKoef: number, assetId: string, sourceId: string): number {
    const source = Source.fromId(sourceId);

    if (assetKoef && source.type === 'book') {
      return assetKoef;
    }

    return 1;
  }
}
