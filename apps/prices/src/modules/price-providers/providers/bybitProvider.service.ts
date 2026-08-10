import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { WebsocketClient, APIMarket } from 'bybit-api';
import { PriceCollectorService } from '../priceCollector.service';
import { PriceReaderService } from '../../reader/reader.service';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@xyro/libs/logger';
import { Config } from 'apps/prices/src/infrastructure/config';
import { Market, Source, SourceType } from '../entities/Source';
import { sleep } from '@xyro/libs/utils';

const TICKER_ID = 'tickers';
type ByBitTickerPayload = {
  topic: string;
  ts: number;
  type: string;
  cs: number;
  data: {
    symbol: string;
    lastPrice: string;
    highPrice24h: string;
    lowPrice24h: string;
    prevPrice24h: string;
    volume24h: string;
    turnover24h: string;
    price24hPcnt: string;
    usdIndexPrice: string;
  };
  wsKey: string;
};

const ORDERBOOK_ID = 'orderbook';
type ByBitOrderbookPayload = {
  topic: string;
  type: string;
  ts: number;
  data: {
    s: string;
    b: number[][];
    a: number[][];
    u: number;
    seq: number;
  };
  cts: number;
  wsKey: number;
};

type ByBitPayload = ByBitTickerPayload | ByBitOrderbookPayload;

const EXCLUDE_LIST = ['XMR'];
const CLOSE_TIMEOUT = 1 * 1000; //  1s

@Injectable()
export class ByBitProvider implements OnModuleInit {
  private client: WebsocketClient;

  constructor(
    @Inject(PriceCollectorService)
    private priceHeapService: PriceCollectorService,
    private logger: LoggerService,
    @Inject(PriceReaderService) private priceReaderService: PriceReaderService,
    private readonly configService: ConfigService<Config>
  ) {
    this.logger.setContext(ByBitProvider.name);
  }

  async onModuleInit() {
    this.createConnection();
  }

  async createConnection() {
    await this.openConnection();
  }

  async openConnection() {
    const { byBitKey, byBitSecret } = this.configService.get('app');

    const wsConfig = {
      key: byBitKey,
      secret: byBitSecret,

      market: 'v5' as APIMarket,

      // how long to wait (in ms) before deciding the connection should be terminated & reconnected
      pongTimeout: 1000,

      // how often to check (in ms) that WS connection is still alive
      pingInterval: 10000,

      // how long to wait before attempting to reconnect (in ms) after connection is closed
      reconnectTimeout: 500,

      // recv window size for authenticated websocket requests (higher latency connections (VPN) can cause authentication to fail if the recv window is too small)
      // recvWindow: 5000,

      // config options sent to RestClient (used for time sync). See RestClient docs.
      // restOptions: { },

      // config for axios used for HTTP requests. E.g for proxy support
      // requestOptions: { }

      // override which URL to use for websocket connections
      // wsUrl: 'wss://stream.bytick.com/realtime'
    };

    this.client = new WebsocketClient(wsConfig, {
      debug: () => undefined,
      error: () => undefined,
      info: () => undefined,
      notice: () => undefined,
      warning: () => undefined,
      silly: () => undefined,
    });

    const connect = new Promise<void>((resolve) => {
      this.client.on('open', ({ event, wsKey }) => {
        this.logger.log(`ByBit connected: ${wsKey}`);
        resolve();
      });
    });

    this.client.on('error', (data) => {
      this.logger.error('ws exception: ', data);
    });

    this.client.on('close', async () => {
      this.logger.warn('ByBit reconnecting...');
      await sleep(CLOSE_TIMEOUT);
      this.createConnection();
    });

    await this.subscribe();

    return connect;
  }

  async subscribe() {
    const assets = await this.priceReaderService.listAssets();
    const assetIds = assets.map((asset) => asset.id);

    this.client.on('update', async (data: ByBitPayload) => {
      this.onEvent(data);
    });

    for (const symbol of assetIds) {
      if (EXCLUDE_LIST.includes(symbol)) {
        return;
      }

      const pair = this.toPairSymbol(symbol);

      this.client.subscribeV5(`tickers.${pair}`, 'spot');
      this.client.subscribeV5(`orderbook.50.${pair}`, 'linear');
    }
  }

  async onEvent(data: ByBitPayload) {
    if (data.topic.startsWith(TICKER_ID)) {
      const payload = data as ByBitTickerPayload;
      const symbol = this.fromPairSymbol(payload.data.symbol);

      const { lastPrice } = payload.data;

      const source = new Source(Market.bybit, SourceType.ticker);
      this.priceHeapService.addPrice(symbol, source, Number(lastPrice));
    }

    if (data.topic.startsWith(ORDERBOOK_ID)) {
      const payload = data as ByBitOrderbookPayload;
      const symbol = this.fromPairSymbol(payload.data.s);

      const asks = this.aggregateBook(payload.data.a);
      const bids = this.aggregateBook(payload.data.b);

      const orders = [asks, bids].filter(
        ([amount, sum]) => sum !== 0 && amount !== 0
      );

      const sumPrices = orders.reduce((sum, item) => {
        return sum + item[1] / item[0];
      }, 0);
      const price = sumPrices / orders.length;

      const source = new Source(Market.bybit, SourceType.book);
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
    return `${symbol}USDT`;
  }

  fromPairSymbol(pairSymbol: string) {
    return pairSymbol.slice(0, -4);
  }
}
