import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { WebSocket } from 'ws';
import { sleep } from '@xyro/libs/utils';
import { LoggerService } from '@xyro/libs/logger';

import { PriceReaderService } from '../../reader/reader.service';
import { PriceCollectorService } from '../priceCollector.service';
import { Market, Source, SourceType } from '../entities/Source';

const WS_API_URL = 'wss://ws.kraken.com';
const CLOSE_TIMEOUT = 1 * 1000; //  1s

type KrakenBook = [number, number, number][];
type KrakenPool = {
  a?: KrakenBook;
  b?: KrakenBook;
  c: number | number[];
};
type KrakenPayload = [number, KrakenPool, string, string];

@Injectable()
export class KrakenProvider implements OnModuleInit {
  private client: WebSocket;
  private assetIds: string[] = [];

  constructor(
    @Inject(PriceCollectorService)
    private priceHeapService: PriceCollectorService,
    private logger: LoggerService,
    @Inject(PriceReaderService) private priceReaderService: PriceReaderService
  ) {
    this.logger.setContext(KrakenProvider.name);
  }

  async onModuleInit() {
    const assets = await this.priceReaderService.listAssets();
    const assetIds = assets.map((asset) => asset.id);
    this.assetIds.push(...assetIds);

    this.createConnection();
  }

  async createConnection() {
    await this.openConnection();
    await this.subscribe();
  }

  async openConnection() {
    this.client = new WebSocket(WS_API_URL);
    const connect = new Promise<void>((resolve) => {
      this.client.on('open', resolve);
    });

    this.client.on('error', (data) => {
      this.logger.error('ws exception: ', JSON.stringify(data));
    });

    this.client.on('close', async () => {
      this.logger.warn('Kraken reconnecting...');
      await sleep(CLOSE_TIMEOUT);
      this.createConnection();
    });

    return connect;
  }

  async subscribe() {
    this.client.on('message', async (data: string) => {
      try {
        const json: KrakenPayload = JSON.parse(data);
        if (!Array.isArray(json)) return;
        this.onEvent(json);
      } catch (e) {}
    });

    const pairs = this.assetIds.map((symbol) => this.toPairSymbol(symbol));

    if (pairs.length === 0) return;

    this.client.send(
      JSON.stringify({
        event: 'subscribe',
        pair: this.assetIds.map((symbol) => this.toPairSymbol(symbol)),
        subscription: {
          name: 'book',
        },
      })
    );
  }

  onEvent(data: KrakenPayload) {
    if (data[2].substring(0, 4) === 'book') {
      const [, book, , pair] = data;
      const assetId = this.fromPairSymbol(pair);

      if (!this.assetIds.includes(assetId)) {
        return;
      }

      const asks = this.aggregateBook(book.a);
      const bids = this.aggregateBook(book.b);

      const orders = [asks, bids].filter(
        ([amount, sum]) => sum !== 0 && amount !== 0
      );

      const sumPrices = orders.reduce((sum, item) => {
        return sum + item[1] / item[0];
      }, 0);
      const price = sumPrices / orders.length;
      const source = new Source(Market.kraken, SourceType.book);

      if (!Number.isNaN(price))
        this.priceHeapService.addPrice(assetId, source, price);
    } else {
      const [, candle, , pair] = data;
      const assetId = this.fromPairSymbol(pair);

      if (!this.assetIds.includes(assetId)) {
        return;
      }

      const price = Number((candle as any).c[0]);
      const source = new Source(Market.kraken, SourceType.ticker);

      this.priceHeapService.addPrice(assetId, source, price);
    }
  }

  private aggregateBook(book: KrakenBook | undefined): [number, number] {
    if (!book) return [0, 0];

    let amount = 0;
    let sum = 0;
    for (const order of book) {
      const orderPrice = Number(order[0]);
      const orderAmount = Number(order[1]);

      amount += orderAmount;
      sum += orderPrice * orderAmount;
    }
    return [amount, sum];
  }

  toPairSymbol(symbol: string) {
    return `${symbol}/USD`;
  }

  fromPairSymbol(pairSymbol: string) {
    const symbol = pairSymbol.split('/')[0];

    return symbol === 'XBT' ? 'BTC' : symbol;
  }
}
