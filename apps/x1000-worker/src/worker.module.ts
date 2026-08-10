import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DateScalar } from '@xyro/libs/graphql';
import { SchedulerModule } from '@xyro/libs/scheduler';
import { LoggerModule } from '@xyro/libs/logger';
import { AppsNames } from '@xyro/core';
import { EventsModule } from '@xyro/libs/events';
import { LedgerModule } from '@xyro/libs/ledger';

import { PrismaModule } from './infrastructure/prisma';

import { configLoader, envValidator, Config } from './infrastructure/config';
import { GrpcModule } from './infrastructure/transports';

import { X1000GameModule } from './module/game/x1000.module';

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
        };
      },
      inject: [ConfigService],
    }),
    SchedulerModule,
    EventsModule.forRootAsync({
      useDomainEventsMode: true,
      useStreamingEventsMode: true,
      useFactory: (configService: ConfigService<Config>) => {
        const { brokers } = configService.get('kafka');
        const { host, port } = configService.get('redis');

        return {
          domainEventsClient: {
            brokers,
            clientId: AppsNames.X1000Worker,
          },
          streamingEventsClient :{
            host,
            port,
          },
        }
      },
      inject: [ConfigService],
    }),
    PrismaModule,

    X1000GameModule,
  ],
  providers: [DateScalar],
})
export class X1000WorkerModule {}
