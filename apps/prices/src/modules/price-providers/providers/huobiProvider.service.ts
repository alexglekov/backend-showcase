import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { WebSocket } from 'ws';
import { sleep } from '@xyro/libs/utils';
import * as zlib from 'zlib';
import { LoggerService } from '@xyro/libs/logger';

import { PriceReaderService } from '../../reader/reader.service';
import { PriceCollectorService } from '../priceCollector.service';
import { Market, Source, SourceType } from '../entities/Source';

const WS_API_URL = 'wss://api.huobi.pro/ws';
const CLOSE_TIMEOUT = 1 * 1000; //  1s

@Injectable()
export class HuobiProvider implements OnModuleInit {
  private client: WebSocket;

  constructor(
    @Inject(PriceCollectorService)
    private priceHeapService: PriceCollectorService,
    private logger: LoggerService,
    @Inject(PriceReaderService) private priceReaderService: PriceReaderService
  ) {
    this.logger.setContext(HuobiProvider.name);
  }

  async onModuleInit() {
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
      this.logger.warn('Huobi reconnecting...');
      await sleep(CLOSE_TIMEOUT);
      this.createConnection();
    });

    return connect;
  }

  async subscribe() {
    this.client.on('message', (data: ArrayBuffer) => {
      zlib.gunzip(data, (err, decompressedData) => {
        if (err) {
          this.logger.error(err);
        } else {
          const decodedData = decompressedData.toString('utf8');
          try {
            const json = JSON.parse(decodedData);
            if (json.status) return;
            if (json.ping) {
              this.client.send(JSON.stringify({ pong: json.ping }));
              return;
            }

            this.onEvent(json);
          } catch (e) {}
        }
      });
    });

    const assets = await this.priceReaderService.listAssets();
    const assetIds = assets.map((asset) => asset.id);

    for (const symbol of assetIds) {
      const pair = this.toPairSymbol(symbol);
      this.client.send(JSON.stringify({ sub: `market.${pair}.ticker` }));
    }
  }

  async onEvent(data: any) {
    const [, pair] = data.ch.split('.');
    const assetId = this.fromPairSymbol(pair);
    const price = Number(data.tick.close);
    const source = new Source(Market.huobi, SourceType.ticker);

    this.priceHeapService.addPrice(assetId, source, price);
  }

  toPairSymbol(symbol: string) {
    return `${symbol}USDT`.toLowerCase();
  }

  fromPairSymbol(pairSymbol: string) {
    return pairSymbol.slice(0, -4).toUpperCase();
  }
}
