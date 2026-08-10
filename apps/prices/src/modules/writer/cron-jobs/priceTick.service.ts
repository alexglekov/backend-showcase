import { AssetPriceChangedDomainEvent } from '@xyro/contracts/prices';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Asset } from '@prisma/client';
import { LoggerService } from '@xyro/libs/logger';
import { DomainEventsPublisher, StreamingEventsPublisher } from '@xyro/libs/events';

import { PriceCollectorService } from '../../price-providers/priceCollector.service';
import { PricesWriterService } from '../writer.service';
import { PriceTimeData } from '../../price-providers/types';
import { PriceReaderService } from '../../reader/reader.service';

const FREQ_IN_MS = 500; // 500 ms

@Injectable()
export class PriceTickService implements OnModuleInit {
  private assetList: Asset[];

  constructor(
    @Inject(PriceCollectorService)
    private priceCollectorService: PriceCollectorService,
    @Inject(PricesWriterService)
    private pricesWriterService: PricesWriterService,
    @Inject(PriceReaderService)
    private priceReaderService: PriceReaderService,
    private readonly domainEventsPublisher: DomainEventsPublisher,
    private readonly streamingEventsPublisher: StreamingEventsPublisher,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(PriceTickService.name);
  }

  async onModuleInit() {
    this.assetList = await this.priceReaderService.listAssets();
  }

  @Interval(FREQ_IN_MS)
  async handleCron() {
    const prices = await this.priceCollectorService.fetchLastPrice();

    for (const asset of this.assetList) {
      const foundPrice = prices.find(
        (priceData) => priceData.assetId === asset.id
      );

      if (!foundPrice) {
        this.logger.error(`No price for: ${asset.id}`);
      }
    }

    this.savePrices(prices);
    this.publishPrices(prices);
  }

  async savePrices(prices: PriceTimeData[]) {
    this.pricesWriterService.savePricesToCache(prices);
    this.pricesWriterService.savePricesToDb(prices);
  }

  publishPrices(prices: PriceTimeData[]) {
    prices.map((assetPrice) => {
      return this.domainEventsPublisher.publish(new AssetPriceChangedDomainEvent(assetPrice));
    });

    prices.map((assetPrice) => {
      return this.streamingEventsPublisher.publish(new AssetPriceChangedDomainEvent(assetPrice));
    });
  }
}
