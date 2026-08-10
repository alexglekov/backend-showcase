import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { DateTime } from 'luxon';
import { Interval } from '@nestjs/schedule';
import { LoggerService } from '@xyro/libs/logger';

import { Asset } from '@prisma/client';
import { AssetService } from '@xyro/libs/columnDb';

import { CandleDataType, CandleRawType } from '../types/candle.common';
import { PrismaService } from '../../../infrastructure/prisma';
import { CandleService } from '../candle.service';
import { AssetRawPrice } from 'libs/columnDb/src/port';

const CANDLE_TIMEFRAME = 5; // 5 s

@Injectable()
export class Candle5sService implements OnModuleInit {
  private assetList: Asset[];

  constructor(
    protected readonly logger: LoggerService,
    @Inject(PrismaService) private prismaService: PrismaService,
    private readonly assetService: AssetService,
    @Inject(CandleService)
    private candleService: CandleService
  ) {
    this.logger.setContext(Candle5sService.name);
  }

  async onModuleInit() {
    this.assetList = await this.prismaService.asset.findMany({
      where: {
        active: true,
      },
    });
  }

  @Interval(CANDLE_TIMEFRAME * 1000)
  async handleCron() {
    const candles = await this.getRawCandles();

    await this.assetService.insertCandlesBatch(candles);
    this.candleService.publishCandles(candles);
  }

  async getRawCandles(): Promise<CandleRawType[]> {
    const startTime = DateTime.fromJSDate(new Date())
      .minus({
        seconds: CANDLE_TIMEFRAME,
      })
      .toJSDate();

    const candlesRawData = await Promise.all(
      this.assetList.map(async (asset) => {
        const prices = await this.assetService.findManyByAsset(asset.id, {
          timestamp: {
            gte: startTime,
          },
        });

        return {
          assetid: asset.id,
          prices,
        };
      })
    );

    return candlesRawData
      .map((candleRawData) => {
        if (candleRawData.prices.length === 0) {
          this.logger.log(`EMPTY ASSETS 5s -> ${candleRawData.assetid}`);
          return undefined;
        }
        const candle = this.extractCandle(candleRawData.prices);

        return {
          assetid: candleRawData.assetid,
          timeframe: CANDLE_TIMEFRAME,
          ...candle,
        };
      })
      .filter(Boolean) as CandleRawType[];
  }

  extractCandle(prices: AssetRawPrice[]): CandleDataType {
    let high: number = -Infinity,
      low: number = Infinity;

    for (const priceData of prices) {
      if (priceData.price > high) {
        high = priceData.price;
      }

      if (priceData.price < low) {
        low = priceData.price;
      }
    }

    const firstPriceData = prices.at(0);
    const lastPriceData = prices.at(-1);

    return {
      open: firstPriceData!.price,
      close: lastPriceData!.price,
      high,
      low,
      opentime: firstPriceData!.timestamp,
      closetime: lastPriceData!.timestamp,
    };
  }
}
