import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SchedulerModule } from '@xyro/libs/scheduler';
import { LoggerModule } from '@xyro/libs/logger';
import { EventsModule } from '@xyro/libs/events';
import { AppsNames } from '@xyro/core';
import { LedgerModule } from '@xyro/libs/ledger';

import { PrismaModule } from './infrastructure/prisma';
import { Config, configLoader, envValidator } from './infrastructure/config';
import { GrpcModule } from './infrastructure/transports';
import { OneVsOneModule } from './game/oneVsOneWorker.module';

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
    EventsModule.forRootAsync({
      useDomainEventsMode: true,
      useFactory: (configService: ConfigService<Config>) => {
        const { brokers } = configService.get('kafka');

        return {
          domainEventsClient: {
            brokers,
            clientId: AppsNames.OneVsOneWorker,
          }
        }
      },
      inject: [ConfigService],
    }),
    SchedulerModule,
    PrismaModule,

    OneVsOneModule,
  ],
  controllers: [],
  providers: [],
})
export class OneVsOneAppModule {}
