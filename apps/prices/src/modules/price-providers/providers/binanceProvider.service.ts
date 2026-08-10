import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { WebsocketStream } from '@htempest/binance-connector';

import { PriceReaderService } from '../../reader/reader.service';
import { PriceCollectorService } from '../priceCollector.service';
import { Market, Source, SourceType } from '../entities/Source';

@Injectable()
export class BinanceProviderService implements OnModuleInit {
  private client: WebsocketStream;

  constructor(
    @Inject(PriceCollectorService)
    private priceHeapService: PriceCollectorService,
    @Inject(PriceReaderService) private priceReaderService: PriceReaderService
  ) {}

  async onModuleInit() {
    const assets = await this.priceReaderService.listAssets();
    const assetIds = assets.map((asset) => asset.id);

    this.initClient();
    this.subscribe(assetIds);
  }

  initClient() {
    this.client = new WebsocketStream({
      callbacks: {
        message: this.onEvent.bind(this),
      },
    });
  }

  subscribe(symbols: string[]) {
    const pairSymbols = symbols.map(this.toPairSymbol);
    pairSymbols.forEach((symbol) => this.client.ticker(symbol));
  }

  async onEvent(data: string) {
    try {
      const payload = JSON.parse(data);
      const assetId = this.fromPairSymbol(payload.s);

      if (payload.e === 'trade') {
        const price = Number(payload.p);
        const source = new Source(Market.binance, SourceType.trade);

        this.priceHeapService.addPrice(assetId, source, price);
      } else {
        const price = Number(payload.c);
        const source = new Source(Market.binance, SourceType.trade);

        this.priceHeapService.addPrice(assetId, source, price);
      }
    } catch (e) {
      return;
    }
  }

  toPairSymbol(symbol: string) {
    return `${symbol}USDT`;
  }

  fromPairSymbol(pairSymbol: string) {
    return pairSymbol.slice(0, -4);
  }
}
