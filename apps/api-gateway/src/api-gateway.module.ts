import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from '@xyro/libs/logger';
import { RedisModule } from '@xyro/libs/redis';
import { SchedulerModule } from '@xyro/libs/scheduler';

import { GrpcModule } from './infrastructure/transports/grpc';
import { Config, configLoader, envValidator } from './infrastructure/config';
import { AuthenticationModule } from './infrastructure/authentication';
import { SchemaRegistryModule } from './infrastructure/third-party';
import { EventBusModule } from './infrastructure/pub-sub';

import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { CoinsPaidModule } from './modules/coins-paid/coinsPaid.module';
import { GraphQLFederatedModule } from './modules/federation/federation.module';
import { GraphQLServerManagerModule } from './infrastructure/graphql';
import { OnlineCounterModule } from './modules/online-counter';
import { AirdropsModule } from './modules/airdrops/airdrops.module';

@Module({
  imports: [
    EventBusModule,
    LoggerModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validate: envValidator,
      load: configLoader,
    }),
    GrpcModule.forRootAsync({
      useFactory: (config: ConfigService<Config>) => {
        const { users, bullsEye, ledger, analytics } = config.get('grpc');

        return {
          analytics,
          users,
          bullsEye,
          ledger,
        }
      },
      inject: [ConfigService],
    }),
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory(config: ConfigService<Config>) {
        const { host, port, keyPrefix } = config.get('redis');

        return {
          host,
          port,
          lazyConnect: true,
          keyPrefix,
        };
      },
    }),
    SchedulerModule,
    CoinsPaidModule,
    AirdropsModule,
    SubscriptionsModule,
    AuthenticationModule,
    SchemaRegistryModule,
    OnlineCounterModule,
    GraphQLFederatedModule,
    GraphQLServerManagerModule,
  ],
})
export class ApiGatewayAppModule {}
