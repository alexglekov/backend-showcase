import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SchedulerModule } from '@xyro/libs/scheduler'
import { LoggerModule } from '@xyro/libs/logger';
import { EventsModule } from '@xyro/libs/events';
import { AppsNames } from '@xyro/core';
import { LedgerModule } from '@xyro/libs/ledger';
import { RedisModule } from '@xyro/libs/redis';

import { PrismaModule } from './infrastructure/prisma';
import { Config, configLoader, envValidator } from './infrastructure/config';
import { GrpcModule } from './infrastructure/transports';
import { UpDownGamesFinalizerModule } from './modules/games-finalizer/upDownGamesFinalizer.module';
import { UpDownGameWorkerModule } from './modules/game-worker/upDownGameWorker.module';
import { DalModule } from './infrastructure/database';
import { AlertManagerModule } from './infrastructure/alert-manager';

@Module({
  imports: [
    LedgerModule.forRoot(),
    LoggerModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validate: envValidator,
      load: configLoader,
    }),
    GrpcModule.forRootAsync({
      useFactory: (config: ConfigService<Config>) => {
        const { prices } = config.get('grpc');
        
        return {
          prices: prices,
        }
      },
      inject: [ConfigService],
    }),
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
    EventsModule.forRootAsync({
      useDomainEventsMode: true,
      useStreamingEventsMode: true,
      useFactory: (configService: ConfigService<Config>) => {
        const { brokers } = configService.get('kafka');
        const { host, port } = configService.get('redis');

        return {
          domainEventsClient: {
            brokers,
            clientId: AppsNames.UpDownWorker,
          },
          streamingEventsClient: {
            host,
            port,
          }
        }
      },
      inject: [ConfigService],
    }),
    SchedulerModule,
    PrismaModule,
    AlertManagerModule,

    DalModule,
    UpDownGameWorkerModule,
    UpDownGamesFinalizerModule,
  ],
})
export class UpDownModule {}
