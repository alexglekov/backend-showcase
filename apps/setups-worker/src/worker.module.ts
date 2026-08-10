import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DateScalar } from '@xyro/libs/graphql';
import { RedisModule } from '@xyro/libs/redis';
import { SchedulerModule } from '@xyro/libs/scheduler';
import { LoggerModule } from '@xyro/libs/logger';
import { EventsModule } from '@xyro/libs/events';
import { LedgerModule } from '@xyro/libs/ledger';
import { AppsNames } from '@xyro/core';

import { DAOModule } from './infrastructure/database';
import { configLoader, envValidator, Config } from './infrastructure/config';
import { GrpcModule } from './infrastructure/transports';

import { SetupGameWorkerModule } from './modules/game-worker/setupGameWorker.module';
import { SetupGamesFinalizerModule } from './modules/games-finalizer/setupGamesFinalizer.module';

@Module({
  imports: [
    LedgerModule.forRoot(),
    LoggerModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validate: envValidator,
      load: configLoader,
    }),
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory(config: ConfigService<Config>) {
        const { host, port } = config.get('redis');

        return {
          host,
          port,
          lazyConnect: true,
        };
      },
    }),
    GrpcModule.forRootAsync({
      useFactory: (config: ConfigService<Config>) => {
        const { prices } = config.get('grpc');

        return {
          prices: prices,
        };
      },
      inject: [ConfigService],
    }),
    SchedulerModule,
    EventsModule.forRootAsync({
      useDomainEventsMode: true,
      useFactory: (configService: ConfigService<Config>) => {
        const { brokers } = configService.get('kafka');

        return {
          domainEventsClient: {
            brokers,
            clientId: AppsNames.SetupsWorker
          },
        }
      },
      inject: [ConfigService],
    }),
    DAOModule,

    SetupGameWorkerModule,
    SetupGamesFinalizerModule,
  ],
  providers: [DateScalar],
})
export class SetupsWorkerModule {}
