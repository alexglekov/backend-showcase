import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  CandleCreatedDomainEvent,
  CandleCreatedDomainEventPayload,
  CandleEntity,
} from '@xyro/contracts/candles';
import { LoggerService } from '@xyro/libs/logger';
import { RedisService } from '@xyro/libs/redis';
import { PricesCacheKeys } from '@xyro/contracts/prices';
import { Asset } from '@prisma/client';

import { PrismaService } from '../../infrastructure/prisma';
import { ListCandlesInput } from './types/candle.input';
import { DomainEventsPublisher } from '@xyro/libs/events';
import { AssetService, CandleRaw } from 'libs/columnDb/src/port';

@Injectable()
export class CandleService implements OnModuleInit {
  private assetList: Asset[];

  constructor(
    protected readonly logger: LoggerService,
    private readonly domainEventsPublisher: DomainEventsPublisher,
    private readonly redis: RedisService,
    @Inject(PrismaService) private prismaService: PrismaService,
    private readonly assetService: AssetService
  ) {
    this.logger.setContext(CandleService.name);
  }

  async onModuleInit() {
    this.assetList = await this.prismaService.asset.findMany({
      where: {
        active: true,
      },
    });
  }

  onCandleCreated(payload: CandleCreatedDomainEventPayload) {
    const firstCandle = payload.candles[0];
    if (!firstCandle) return;

    switch (firstCandle.timeframe) {
      case 5: {
        // this.logger.log('5s');
        this.to15sCandle(payload);
        break;
      }
      case 15: {
        // this.logger.log('15s');
        this.to30sCandle(payload);
        break;
      }
      case 30: {
        this.logger.log('30s');
        this.to1mCandle(payload);
        break;
      }
      case 60: {
        this.logger.log('1m');
        this.to5mCandle(payload);
        break;
      }
      case 300: {
        this.logger.log('5m');
        this.to15mCandle(payload);
        break;
      }
      case 900: {
        this.logger.log('15m');
        this.to30mCandle(payload);
        break;
      }
      case 1800: {
        this.logger.log('30m');
        this.to1hCandle(payload);
        break;
      }
      case 3600: {
        this.logger.log('1h');
        this.to2hCandle(payload);
        break;
      }
      case 7200: {
        this.logger.log('2h');
        this.to4hCandle(payload);
        break;
      }
      case 14400: {
        this.logger.log('4h');
        this.to8hCandle(payload);
        break;
      }
      case 28800: {
        this.logger.log('8h');
        this.to1dCandle(payload);
        break;
      }
      case 86400: {
        this.logger.log('1d');
        break;
      }
    }
  }

  async to15sCandle(payload: CandleCreatedDomainEventPayload) {
    const key = `${PricesCacheKeys.candle}:15`;
    const count = 3;

    return this.processCandle(payload, key, count);
  }

  async to30sCandle(payload: CandleCreatedDomainEventPayload) {
    const key = `${PricesCacheKeys.candle}:30`;
    const count = 2;

    return this.processCandle(payload, key, count);
  }

  async to1mCandle(payload: CandleCreatedDomainEventPayload) {
    const key = `${PricesCacheKeys.candle}:60`;
    const count = 2;

    return this.processCandle(payload, key, count);
  }

  async to5mCandle(payload: CandleCreatedDomainEventPayload) {
    const key = `${PricesCacheKeys.candle}:300`;
    const count = 5;

    return this.processCandle(payload, key, count);
  }

  async to15mCandle(payload: CandleCreatedDomainEventPayload) {
    const key = `${PricesCacheKeys.candle}:900`;
    const count = 3;

    return this.processCandle(payload, key, count);
  }

  async to30mCandle(payload: CandleCreatedDomainEventPayload) {
    const key = `${PricesCacheKeys.candle}:1800`;
    const count = 2;

    return this.processCandle(payload, key, count);
  }

  async to1hCandle(payload: CandleCreatedDomainEventPayload) {
    const key = `${PricesCacheKeys.candle}:3600`;
    const count = 2;

    return this.processCandle(payload, key, count);
  }

  async to2hCandle(payload: CandleCreatedDomainEventPayload) {
    const key = `${PricesCacheKeys.candle}:7200`;
    const count = 2;

    return this.processCandle(payload, key, count);
  }

  async to4hCandle(payload: CandleCreatedDomainEventPayload) {
    const key = `${PricesCacheKeys.candle}:14400`;
    const count = 2;

    return this.processCandle(payload, key, count);
  }

  async to8hCandle(payload: CandleCreatedDomainEventPayload) {
    const key = `${PricesCacheKeys.candle}:28800`;
    const count = 2;

    return this.processCandle(payload, key, count);
  }

  async to1dCandle(payload: CandleCreatedDomainEventPayload) {
    const key = `${PricesCacheKeys.candle}:86400`;
    const count = 3;

    return this.processCandle(payload, key, count);
  }

  async processCandle(
    payload: CandleCreatedDomainEventPayload,
    key: string,
    count: number
  ) {
    const candles = payload.candles;

    const currentData = await this.redis.get<CandleEntity[][]>(key);
    if (!currentData) {
      return this.redis.set(key, [candles]);
    }

    currentData.push(candles);

    if (currentData.length >= count) {
      const candles = await this.exctractCandle(currentData);
      currentData.splice(0, currentData.length);

      const raws = candles.map((candle) => candle.toRaw());
      this.saveCandles(raws);
      this.publishCandles(raws);
    }
    await this.redis.set(key, currentData);
  }

  async exctractCandle(data: CandleEntity[][]) {
    const candles = await Promise.all(
      this.assetList.map(async (asset) => {
        const candlesData: CandleEntity[] = data
          .map((singleSet) => {
            return singleSet.find(
              (candle) => candle.assetId === asset.id
            ) as CandleEntity;
          })
          .filter(Boolean);

        if (candlesData.length === 0) {
          this.logger.log(`EMPTY AGGREGATE list -> ${asset.id}`);
        }

        return this.aggregateCandle(candlesData);
      })
    );

    return candles;
  }

  aggregateCandle(candles: CandleEntity[]): CandleEntity {
    let high: number = -Infinity,
      low: number = Infinity;

    for (const candlesData of candles) {
      if (candlesData.high > high) {
        high = candlesData.high;
      }

      if (candlesData.low < low) {
        low = candlesData.low;
      }
    }

    const firstPriceData = candles.at(0);
    const lastPriceData = candles.at(-1);

    return new CandleEntity({
      assetid: firstPriceData!.assetId,
      timeframe: firstPriceData!.timeframe * candles.length,
      open: firstPriceData!.open,
      close: lastPriceData!.close,
      high,
      low,
      opentime: firstPriceData!.openTime,
      closetime: lastPriceData!.closeTime,
    });
  }

  saveCandles(candles: CandleRaw[]) {
    return this.assetService.insertCandlesBatch(candles);
  }

  publishCandles(candles: CandleRaw[]) {
    return this.domainEventsPublisher.publish(
      new CandleCreatedDomainEvent(candles)
    );
  }

  async listCandles({
    assetId,
    timeframe,
    startDate,
    endDate,
  }: ListCandlesInput) {
    const candlesRaw = await this.assetService.findCandlesByRange(
      assetId,
      timeframe,
      new Date(startDate),
      new Date(endDate)
    );

    return candlesRaw.map((candle) => new CandleEntity(candle));
  }
}
