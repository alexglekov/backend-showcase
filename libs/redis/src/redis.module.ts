import { DynamicModule, Global, Module } from '@nestjs/common';
import { LoggerModule } from '@xyro/libs/logger';

import { RedisModuleAsyncOptions } from './interfaces/redisAsync.options';
import { REDIS_MODULE_CONFIG_TOKEN } from './tokens';
import { RedisService } from './redis.service';

@Module({})
@Global()
export class RedisModule {
  public static forRootAsync(
    options: RedisModuleAsyncOptions,
  ): DynamicModule {
    return {
      module: RedisModule,
      global: true,
      imports: [
        ...(options.imports ?? []),
        LoggerModule.forRoot()
      ],
      exports: [RedisService],
      providers: [
        {
          provide: REDIS_MODULE_CONFIG_TOKEN,
          useFactory: options.useFactory,
          inject: options.inject,
        },
        {
          provide: RedisService,
          useClass: RedisService,
        },
      ],
    };
  }
}
