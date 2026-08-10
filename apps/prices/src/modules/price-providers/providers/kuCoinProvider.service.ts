import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { WebSocket } from 'ws';
import { lastValueFrom } from 'rxjs';
import { sleep } from '@xyro/libs/utils';
import { LoggerService } from '@xyro/libs/logger';

import { PriceCollectorService } from '../priceCollector.service';
import { PriceReaderService } from '../../reader/reader.service';

import { Market, Source, SourceType } from '../entities/Source';

const BASE_URL = 'https://api.kucoin.com';
const CLOSE_TIMEOUT = 1 * 1000; //  1s

const getRandomNumber = () => Math.floor(Math.random() * 1000000000000000);

const TICKER_ID = '/market/ticker';
type KuCoinTickerPayload = {
  id?: string;
  topic: string;
  type: string;
  data: {
    bestAsk: string;
    bestAskSize: string;
    bestBid: string;
    bestBidSize: string;
    price: string;
    sequence: string;
    size: string;
    time: number;
  };
  subject: string;
};

const ORDERBOOK_ID = '/spotMarket/level2Depth50';
type KuCoinOrderbookPayload = {
  id?: string;
  topic: string;
  type: string;
  data: {
    bids: number[][];
    asks: number[][];
    timestamp: number;
  };
  subject: string;
};
type KuCoinPayload = KuCoinTickerPayload | KuCoinOrderbookPayload;

@Injectable()
export class KuCoinProvider implements OnModuleInit {
  private client: WebSocket;
  private interval: NodeJS.Timer;

  constructor(
    @Inject(PriceCollectorService)
    private priceHeapService: PriceCollectorService,
    private logger: LoggerService,
    @Inject(PriceReaderService) private priceReaderService: PriceReaderService,
    protected readonly httpService: HttpService
  ) {
    this.logger.setContext(KuCoinProvider.name);
  }

  async onModuleInit() {
    this.createConnection();
  }

  async createConnection() {
    await this.openConnection();
    await this.subscribe();
  }

  async openConnection() {
    const response = await lastValueFrom(
      this.httpService.post(`${BASE_URL}/api/v1/bullet-public`)
    );
    const payload = response.data.data;

    const token = payload.token;
    const server = payload.instanceServers[0];
    const url = `${server.endpoint}?token=${token}`;

    if (!token && !server) {
      this.logger.error(`Can't get token`);
      return;
    }

    this.client = new WebSocket(url);
    const connect = new Promise<void>((resolve) => {
      this.client.on('open', resolve);
    });

    this.client.on('error', (data) => {
      this.logger.error('ws exception: ', data);
    });

    this.client.on('close', async () => {
      this.logger.warn('KuCoin reconnecting...');
      if (this.interval) {
        clearInterval(this.interval);
      }

      await sleep(CLOSE_TIMEOUT);
      this.createConnection();
    });

    this.interval = setInterval(() => {
      this.client.send(
        JSON.stringify({
          id: getRandomNumber(),
          type: 'ping',
        })
      );
    }, server.pingInterval);

    return connect;
  }

  async subscribe() {
    const assets = await this.priceReaderService.listAssets();
    const assetIds = assets.map((asset) => asset.id);
    const pairs = assetIds.map((symbol) => this.toPairSymbol(symbol));

    this.client.on('message', (data: any) => {
      try {
        const json = JSON.parse(data);
        this.onEvent(json);
      } catch (e) {}
    });

    if (pairs.length === 0) {
      return;
    }

    this.client.send(
      JSON.stringify({
        id: getRandomNumber(),
        type: 'subscribe',
        topic: `${TICKER_ID}:${pairs.join(',')}`,
        privateChannel: false,
        response: true,
      })
    );

    this.client.send(
      JSON.stringify({
        id: getRandomNumber(),
        type: 'subscribe',
        topic: `${ORDERBOOK_ID}:${pairs.join(',')}`,
        privateChannel: false,
        response: true,
      })
    );
  }

  async onEvent(data: KuCoinPayload) {
    if (!data || !data.topic) {
      return;
    }

    if (data.topic.startsWith(TICKER_ID)) {
      const payload = data as KuCoinTickerPayload;
      const pair = payload.topic.split(':')[1];
      const symbol = this.fromPairSymbol(pair);

      const { price } = payload.data;
      const source = new Source(Market.kucoin, SourceType.ticker);

      this.priceHeapService.addPrice(symbol, source, Number(price));
    }

    if (data.topic.startsWith(ORDERBOOK_ID)) {
      const payload = data as KuCoinOrderbookPayload;
      const pair = payload.topic.split(':')[1];
      const symbol = this.fromPairSymbol(pair);

      const asks = this.aggregateBook(payload.data.asks);
      const bids = this.aggregateBook(payload.data.bids);

      const orders = [asks, bids].filter(
        ([amount, sum]) => sum !== 0 && amount !== 0
      );
      const sumPrices = orders.reduce((sum, item) => {
        return sum + item[1] / item[0];
      }, 0);
      const price = sumPrices / orders.length;
      const source = new Source(Market.kucoin, SourceType.book);

      this.priceHeapService.addPrice(symbol, source, price);
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
    return `${symbol}-USDT`;
  }

  fromPairSymbol(pairSymbol: string) {
    return pairSymbol.slice(0, -5);
  }
}
