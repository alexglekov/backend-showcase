import { Global, Module } from '@nestjs/common';
import { OneVsOneCacheService } from './cache.service';
import { RedisModule } from '@xyro/libs/redis';
import { ConfigService } from '@nestjs/config';

import { Config } from '../../infrastructure/config';

@Global()
@Module({
  imports: [
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory(config: ConfigService<Config>) {
        const { host, port } = config.get('redis')

        return {
          host,
          port,
          lazyConnect: true,
        }
      },
    }),
  ],
  providers: [OneVsOneCacheService],
  exports: [OneVsOneCacheService],
})
export class CacheModule {}