import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@xyro/libs/redis';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LoggerService } from '@xyro/libs/logger';

import { Config } from '../../infrastructure/config';
import { GlobalPubSubService } from '../../infrastructure/pub-sub';

const ONLINE_COUNT_CACHE_KEY = 'online-count';
const ONLINE_COUNT_CACHE_TTL = 10; // in seconds

@Injectable()
export class OnlineCounterService implements OnModuleInit {
  private availableGateways: string[] = [];

  constructor(
    private readonly logger: LoggerService,
    private readonly redisService: RedisService,
    private readonly pubSubService: GlobalPubSubService,
    private readonly configService: ConfigService<Config>,
  ) {
    this.logger.setContext(OnlineCounterService.name);
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async refreshTTL() {
    const key = this.getOnlineCountCacheKey();

    await this.redisService.expire(key, ONLINE_COUNT_CACHE_TTL);
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async refreshAvailableGateways() {
    const { keyPrefix } = this.configService.get('redis');

    const matchPattern = this.getOnlineCountCacheKeyMatchPattern();

    const stream = this.redisService.scanStream(matchPattern);

    // TODO: Rewrite this code to Observable
    const availableGateways = await new Promise<string[]>((resolve, reject) => {
      let keys: string[] = [];
      
      stream.on("data", (chunk: string[] = []) => {
        keys.push(...chunk);
      });
      stream.on("end", () => resolve(keys));
      stream.on("error", error => reject(error));
    });

    this.availableGateways = availableGateways.map((gatewayKey) => gatewayKey.replace(keyPrefix, ''));
  }

  async onModuleInit() {
    const key = this.getOnlineCountCacheKey();

    await this.redisService.initCounter(
      key,
      0,
      { expiresInSeconds: ONLINE_COUNT_CACHE_TTL }
    );
  }

  public async registConnection(idtf: string) {
    const key = this.getOnlineCountCacheKey();

    await this.redisService.incrementCounter(key);
    await this.onOnlineChanged();
  }

  public async unregistConnection(idtf: string) {
    const key = this.getOnlineCountCacheKey();

    await this.redisService.decrementCounter(key);
    await this.onOnlineChanged();
  }

  private async onOnlineChanged() {
    const onlineCount = await this.getOnlineCount();

    this.logger.log({
      action: `Count online changed`,
      payload: {
        onlineCount,
      }
    });

    await this.pubSubService.publishOnlineCount({
      online: onlineCount,
    });
  }

  async getOnlineCount(): Promise<number> {
    const values = await Promise.all(
      this.availableGateways.map((gatewayKey) => this.redisService.get<number>(gatewayKey)),
    );

    const currentOnline = values.reduce((currentValue, value) => (currentValue || 0) + (value || 0), 0) || 0;

    return currentOnline + 700;
  }

  private getOnlineCountCacheKey() {
    const { replicaId } = this.configService.get('app');

    return `${ONLINE_COUNT_CACHE_KEY}:${replicaId}`;
  }

  private getOnlineCountCacheKeyMatchPattern() {
    const { keyPrefix } = this.configService.get('redis');

    return `${keyPrefix}${ONLINE_COUNT_CACHE_KEY}*`;
  }
}
