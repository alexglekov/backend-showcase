import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { WebSocket } from 'ws';
import { sleep } from '@xyro/libs/utils';
import { LoggerService } from '@xyro/libs/logger';

import { PriceCollectorService } from '../priceCollector.service';
import { PriceReaderService } from '../../reader/reader.service';

import { Market, Source, SourceType } from '../entities/Source';

const URL = 'wss://ws.bitget.com/spot/v1/stream';
const CLOSE_TIMEOUT = 1 * 1000; //  1s
const PING_TIMEOUT = 30 * 1000; // 30s

const TICKER_ID = 'ticker';
type TickerData = {
  instId: string;
  last: string;
  open24h: string;
  high24h: string;
  low24h: string;
  bestBid: string;
  bestAsk: string;
  baseVolume: string;
  quoteVolume: string;
  ts: number;
  labeId: number;
  openUtc: string;
  chgUTC: string;
  bidSz: string;
  askSz: string;
};
type BitGetTickerPayload = {
  action: 'snapshot';
  arg: { instType: 'sp'; channel: string; instId: string };
  data: TickerData[];
  subject: string;
};

const ORDERBOOK_ID = 'books15';
type BitGetOrderbookPayload = {
  action: 'snapshot';
  arg: { instType: 'sp'; channel: string; instId: string };
  data: [
    {
      asks: number[][];
      bids: number[][];
      checksum: number;
      ts: string;
    }
  ];
  ts: number;
};
type BitGetPayload = BitGetTickerPayload | BitGetOrderbookPayload;

@Injectable()
export class BitGetProvider implements OnModuleInit {
  private client: WebSocket;
  private interval: NodeJS.Timer;

  constructor(
    @Inject(PriceCollectorService)
    private priceHeapService: PriceCollectorService,
    private logger: LoggerService,
    @Inject(PriceReaderService) private priceReaderService: PriceReaderService
  ) {
    this.logger.setContext(BitGetProvider.name);
  }

  async onModuleInit() {
    this.createConnection();
  }

  async createConnection() {
    await this.openConnection();
    await this.subscribe();
  }

  async openConnection() {
    this.logger.log('BitGetProvider: open new connection');

    this.client = new WebSocket(URL);
    const connect = new Promise<void>((resolve) => {
      this.client.on('open', resolve);
    });

    this.client.on('error', (data) => {
      this.logger.error('ws exception: ', data);
    });

    this.client.on('close', async () => {
      this.logger.warn('BitGet reconnecting...');
      if (this.interval) {
        clearInterval(this.interval);
      }

      await sleep(CLOSE_TIMEOUT);
      this.createConnection();
    });

    this.interval = setInterval(() => {
      this.client.send('ping');
    }, PING_TIMEOUT);

    return connect;
  }

  async subscribe() {
    const topics = [];

    const assets = await this.priceReaderService.listAssets();
    const assetIds = assets.map((asset) => asset.id);
    const pairs = assetIds.map((symbol) => this.toPairSymbol(symbol));

    this.client.on('message', (data: any) => {
      try {
        const json = JSON.parse(data);
        this.onEvent(json);
      } catch (e) {}
    });

    if (pairs.length === 0) return;

    for (const pair of pairs) {
      topics.push(
        {
          instType: 'SP',
          channel: TICKER_ID,
          instId: pair,
        },
        {
          instType: 'SP',
          channel: ORDERBOOK_ID,
          instId: pair,
        }
      );
    }

    this.client.send(
      JSON.stringify({
        op: 'subscribe',
        args: topics,
      })
    );
  }

  async onEvent(data: BitGetPayload) {
    if (!data || !data.data) {
      return;
    }

    if (data.arg.channel === TICKER_ID) {
      const tickerData = data as BitGetTickerPayload;

      for (const payload of tickerData.data) {
        const symbol = this.fromPairSymbol(payload.instId);
        const price = Number(payload.last);

        const source = new Source(Market.bitget, SourceType.ticker);

        this.priceHeapService.addPrice(symbol, source, price);
      }
    }

    if (data.arg.channel === ORDERBOOK_ID) {
      const tickerData = data as BitGetOrderbookPayload;

      for (const payload of tickerData.data) {
        const symbol = this.fromPairSymbol(data.arg.instId);

        const asks = this.aggregateBook(payload.asks);
        const bids = this.aggregateBook(payload.bids);
        const orders = [asks, bids].filter(
          ([amount, sum]) => sum !== 0 && amount !== 0
        );
        const sumPrices = orders.reduce((sum, item) => {
          return sum + item[1] / item[0];
        }, 0);

        const price = sumPrices / orders.length;
        const source = new Source(Market.bitget, SourceType.book);

        this.priceHeapService.addPrice(symbol, source, price);
      }
    }
  }

  private aggregateBook(book: number[][]): [number, number] {
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
    return `${symbol}USDT`;
  }

  fromPairSymbol(pairSymbol: string) {
    return pairSymbol.slice(0, -4);
  }
}
