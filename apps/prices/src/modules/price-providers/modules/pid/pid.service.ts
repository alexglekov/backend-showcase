import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@xyro/libs/logger';
import {
  AssetPriceChangedDomainEventPayload,
  PricesPidCacheKeys,
} from '@xyro/contracts/prices';

import { RedisService } from '@xyro/libs/redis';
import { PriceReaderService } from '../../../reader/reader.service';
import {
  AssetKoefMap,
  KoefMap,
  PidKoefMap,
  PrevRowsMap,
  TargetDevMap,
} from './pid.types';
import { SetDeviationInput } from './types/pid.input.types';

const PRICE_ANALISYS_COUNT = 5 * 60 * 2;

@Injectable()
export class PidService implements OnModuleInit {
  constructor(
    private readonly redis: RedisService,
    private readonly logger: LoggerService,
    @Inject(PriceReaderService)
    private priceReaderService: PriceReaderService
  ) {
    this.logger.setContext(PidService.name);
  }

  onModuleInit() {
    this.initPidKoef();
  }

  async initPidKoef() {
    const sumPrice: KoefMap = {};
    const prevRows: PrevRowsMap = {};

    const assets = await this.priceReaderService.listAssets();
    for (const { id } of assets) {
      const prices = await this.priceReaderService.getAssetPrices({
        id,
        take: PRICE_ANALISYS_COUNT,
        skip: 0,
      });

      if (!prices) return;
      prevRows[id] = prices.map((priceData) => priceData.price);
      sumPrice[id] = prices.reduce(
        (sum, priceData) => sum + priceData.price,
        0
      );
    }

    await this.redis.set(PricesPidCacheKeys.sumPrice, sumPrice);
    await this.redis.set(PricesPidCacheKeys.prevRows, prevRows);

    const { pidKoef, targetDev, assetKoef } = await this.getData();

    for (const { id } of assets) {
      if (!pidKoef[id]) pidKoef[id] = { p: 0.1, i: 0.1, d: 0.1 };
      if (!assetKoef[id]) assetKoef[id] = { ie: 0, e: 0, k: 1 };
      if (!targetDev[id]) targetDev[id] = null;
    }

    await this.redis.set(PricesPidCacheKeys.pidKoef, pidKoef);
    await this.redis.set(PricesPidCacheKeys.assetKoef, assetKoef);
    await this.redis.set(PricesPidCacheKeys.targetDev, targetDev);
  }

  // Масштабиование силы воздействия
  // на входе от - бес, до + бес
  // на выходе от 0 до 2
  // эта функция может быть улучшенв
  scaledForce(x: number) {
    return Math.tanh(x) + 1;
  }

  async priceProcessing(payload: AssetPriceChangedDomainEventPayload): Promise<void> {
    const { assetId, price } = payload;

    const { assetKoef, deviation, pidKoef, prevRows, sumPrice, targetDev } =
      await this.getData();

    if (!Array.isArray(prevRows[assetId])) return;

    prevRows[assetId].push(price);
    sumPrice[assetId] += price;
    sumPrice[assetId] -= prevRows[assetId].shift() || 0;
    const avg = sumPrice[assetId] / PRICE_ANALISYS_COUNT;
    let sum = 0;
    for (const price of prevRows[assetId]) {
      const diff = avg - price;
      sum += diff * diff;
    }
    deviation[assetId] = Math.sqrt(sum / PRICE_ANALISYS_COUNT);
    if (targetDev[assetId]) {
      const err = targetDev[assetId]! - deviation[assetId];
      const pid = pidKoef[assetId];
      const ie = assetKoef[assetId].ie + err;
      const de = assetKoef[assetId].e - err;
      const value = pid.p * err + pid.i * ie + pid.d * de;
      assetKoef[assetId].k = this.scaledForce(value);
      assetKoef[assetId].ie = ie;
      assetKoef[assetId].e = err;
    } else {
      assetKoef[assetId].k = 1;
    }

    await this.redis.set(PricesPidCacheKeys.sumPrice, sumPrice);
    await this.redis.set(PricesPidCacheKeys.prevRows, prevRows);

    await this.redis.set(PricesPidCacheKeys.deviation, deviation);
    await this.redis.set(PricesPidCacheKeys.assetKoef, assetKoef);
  }

  private async getData() {
    // кеш суммы последовательности цен
    const sumPrice = (await this.redis.get<KoefMap>(PricesPidCacheKeys.sumPrice)) || {};
    // кеш последовательности цен
    const prevRows =
      (await this.redis.get<PrevRowsMap>(PricesPidCacheKeys.prevRows)) || {};

    // текущее отклонение (для контроля из АПИ)
    const deviation = (await this.redis.get<KoefMap>(PricesPidCacheKeys.deviation)) || {};
    // целевое отклонение
    const targetDev =
      (await this.redis.get<TargetDevMap>(PricesPidCacheKeys.targetDev)) || {};
    // коэффициенты регулятора

    const pidKoef = (await this.redis.get<PidKoefMap>(PricesPidCacheKeys.pidKoef)) || {};
    // высичляемые значения регулятора
    const assetKoef =
      (await this.redis.get<AssetKoefMap>(PricesPidCacheKeys.assetKoef)) || {};

    return {
      sumPrice,
      prevRows,
      deviation,
      targetDev,
      pidKoef,
      assetKoef,
    };
  }

  async getPriceKoefInfo() {
    const { assetKoef, deviation, pidKoef, targetDev } = await this.getData();
    return {
      deviation,
      targetDev,
      pidKoef,
      assetKoef,
    };
  }

  async setPriceKoef({ assetId, setTargetDev, setPidKoef }: SetDeviationInput) {
    const { pidKoef, targetDev } = await this.getData();

    if (setTargetDev) {
      targetDev[assetId] = setTargetDev;

      await this.redis.set(PricesPidCacheKeys.targetDev, targetDev);
    }

    if (setPidKoef) {
      pidKoef[assetId] = setPidKoef;

      await this.redis.set(PricesPidCacheKeys.pidKoef, pidKoef);
    }
  }
}
