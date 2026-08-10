import { DefaultLogger, WebsocketClient, WsDataEvent } from 'okx-api';

import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { PriceReaderService } from '../../reader/reader.service';
import { PriceCollectorService } from '../priceCollector.service';
import { Market, Source, SourceType } from '../entities/Source';
import { sleep } from '@xyro/libs/utils';
import { LoggerService } from '@xyro/libs/logger';

type OkxBook = [number, number, number, number][];
const CLOSE_TIMEOUT = 1 * 1000; //  1s

@Injectable()
export class OkxProvider implements OnModuleInit {
  private client: WebsocketClient;

  constructor(
    @Inject(PriceCollectorService)
    private priceHeapService: PriceCollectorService,
    private logger: LoggerService,
    @Inject(PriceReaderService) private priceReaderService: PriceReaderService
  ) {
    this.logger.setContext(OkxProvider.name);
  }

  async onModuleInit() {
    this.createConnection();
  }

  async createConnection() {
    await this.openConnection();
    await this.subscribe();
  }

  openConnection() {
    const emptyFunc = () => {};

    const logger = {
      ...DefaultLogger,
      silly: emptyFunc,
      debug: emptyFunc,
      notice: emptyFunc,
      info: emptyFunc,
      warning: emptyFunc,
      error: emptyFunc,
    };

    this.client = new WebsocketClient(
      {
        market: 'prod',
      },
      logger
    );

    this.client.on('error', (data) => {
      this.logger.error('ws exception: ', JSON.stringify(data));
    });

    this.client.on('close', async () => {
      this.logger.warn('Okx reconnecting...');
      await sleep(CLOSE_TIMEOUT);
      this.createConnection();
    });
  }

  async subscribe() {
    const assets = await this.priceReaderService.listAssets();
    const assetIds = assets.map((asset) => asset.id);

    this.client.on('update', this.onEvent.bind(this));

    assetIds.forEach((symbol) => {
      this.client.subscribe({
        channel: 'books',
        instId: this.toPairSymbol(symbol),
      });

      this.client.subscribe({
        channel: 'tickers',
        instId: this.toPairSymbol(symbol),
      });

      this.client.subscribe({
        channel: 'candle1m',
        instId: this.toPairSymbol(symbol),
      });
    });
  }

  async onEvent(data: WsDataEvent) {
    if (!data.arg.instId) return;
    const assetId = this.fromPairSymbol(data.arg.instId);

    if (data.arg.channel === 'books') {
      const price = this.getPriceFromBooks(data);
      const source = new Source(Market.okx, SourceType.book);

      if (price) this.priceHeapService.addPrice(assetId, source, price);
    } else if (data.arg.channel === 'tickers') {
      const { last: price } = data.data[0];
      const source = new Source(Market.okx, SourceType.ticker);

      this.priceHeapService.addPrice(assetId, source, Number(price));
    } else {
      // candle1m
      const [, , , , close] = data.data[0];
      const source = new Source(Market.okx, SourceType.ticker);

      this.priceHeapService.addPrice(assetId, source, Number(close));
    }
  }

  private getPriceFromBooks(data: WsDataEvent) {
    if (!data.data[0].asks.length || !data.data[0].bids.length) {
      return;
    }

    const ask = this.getTotalAmountForBook(data.data[0].asks);
    const bid = this.getTotalAmountForBook(data.data[0].bids);

    const limit = Math.min(ask, bid);

    const [askAmount, askSum] = this.aggregateBook(data.data[0].asks, limit);
    const [bidAmount, bidSum] = this.aggregateBook(data.data[0].bids, limit);

    return (askSum / askAmount + bidSum / bidAmount) / 2;
  }

  private getTotalAmountForBook(book: OkxBook) {
    let amount = 0;
    for (const order of book) {
      const orderAmount = Number(order[1]);
      amount += orderAmount;
    }
    return amount;
  }

  private aggregateBook(book: OkxBook, limit: number) {
    let amount = 0;
    let sum = 0;
    for (const order of book) {
      const orderPrice = Number(order[0]);
      const orderAmount = Number(order[1]);
      if (amount + orderAmount > limit) {
        const restAmount = limit - amount;
        amount += restAmount;
        sum += orderPrice * restAmount;
        break;
      } else {
        amount += orderAmount;
        sum += orderPrice * orderAmount;
      }
    }
    return [amount, sum];
  }

  toPairSymbol(symbol: string) {
    return `${symbol}-USDT`;
  }

  fromPairSymbol(pairSymbol: string) {
    return pairSymbol.slice(0, -5);
  }
}
