import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Redis, ScanStream } from 'ioredis';

import { RedisModuleOptions } from './interfaces/redis.options';
import { REDIS_MODULE_CONFIG_TOKEN } from './tokens';
import { LoggerService } from '@xyro/libs/logger';

type SetOptions = {
  expiresInSeconds?: number;
}

type UseCallbackOptions = SetOptions & {
  /**
   * @description Default: true
   */
  parse?: boolean;
}

@Injectable()
export class RedisService implements OnModuleDestroy, OnModuleInit {
  private readonly client: Redis;
  
  constructor(
    private readonly logger: LoggerService,
    @Inject(REDIS_MODULE_CONFIG_TOKEN) options: RedisModuleOptions
  ) {
    this.client = new Redis({
      ...options,
      maxRetriesPerRequest: null,
      connectTimeout: 30000,
      keepAlive: 10000,
    });

    this.logger.setContext(RedisService.name);
  }

  getClient() {
    return this.client;
  }

  async useCallback<T>(key: string, callback: () => Promise<T>, options?: UseCallbackOptions) {
    const cached = await this.get<T>(key, options?.parse || undefined);
    if (cached) return cached;
    const data = await callback();
    await this.set(key, data, options);
    return data;
  }

  async get<T>(key: string, parse: boolean = true): Promise<T | undefined> {
    const line = await this.client.get(key);
    return line ? parse ? JSON.parse(line): line : undefined as T;
  }

  async getBatch<T>(keys: string[], parse: boolean = true): Promise<(T | undefined)[]> {
    const lines = await this.client.mget(keys);
    return lines.map((line) => line ? parse ? JSON.parse(line): line : undefined as T);
  }

  async incrementCounter(key: string, amount?: number): Promise<number | undefined> {
    return this.client.incrby(key, amount || 1);
  }

  async expire(key: string, ttl: number): Promise<void> {
    await this.client.expire(key, ttl);
  }

  async initCounter(key: string, initialValue?: number, options?: SetOptions): Promise<number> {
    await this.set<number>(key, initialValue || 0, options);

    return initialValue || 0;
  }

  async decrementCounter(key: string, amount?: number): Promise<number | undefined> {
    return this.client.decrby(key, amount || 1);
  }

  public scanStream<T>(matchPattern: string): ScanStream {
    return this.client.scanStream({
      match: matchPattern,
    });
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async update<T>(key: string, payload: T): Promise<T> {
    await this.client.set(key, JSON.stringify(payload));
    return payload;
  }

  async set<T>(key: string, payload: T, options?: SetOptions): Promise<T> {
    const params: any[] = [];

    if (options && options.expiresInSeconds) {
      params.push('EX');
      params.push(options?.expiresInSeconds);
    }

    let preparedPayload: string;

    if (typeof payload !== 'string') {
      preparedPayload = JSON.stringify(payload);
    } else {
      preparedPayload = payload;
    }

    await this.client.set(key, preparedPayload, ...params);

    return payload;
  }

  async onModuleInit() {
    try {
      await this.client.connect();
    } catch (error) {
      this.logger.error(error);
    }
  }

  async onModuleDestroy() {
    await this.client.disconnect();
  }
}
