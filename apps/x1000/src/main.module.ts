import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { DateScalar } from '@xyro/libs/graphql';
import { LedgerModule } from '@xyro/libs/ledger';
import { RedisModule } from '@xyro/libs/redis';
import { LoggerModule } from '@xyro/libs/logger';
import { EventsModule } from '@xyro/libs/events';
import { AppsNames } from '@xyro/core';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';

import { PrismaModule } from './infrastructure/prisma';
import { configLoader, envValidator, Config } from './infrastructure/config';
import { GrpcModule } from './infrastructure/transports';
import { X1000GameModule } from './module/game/x1000.module';

@Module({
  imports: [
    LoggerModule.forRoot(),
    LedgerModule.forRoot(false),
    ConfigModule.forRoot({
      isGlobal: true,
      validate: envValidator,
      load: configLoader,
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      playground: true,
      csrfPrevention: false,
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
      autoSchemaFile: {
        federation: 2,
      },
      buildSchemaOptions: {
        orphanedTypes: [UserGraphQLOrphanEntity],
      },
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
    EventsModule.forRootAsync({
      useDomainEventsMode: true,
      useStreamingEventsMode: true,
      useFactory: (configService: ConfigService<Config>) => {
        const { brokers } = configService.get('kafka');
        const { host, port } = configService.get('redis');

        return {
          domainEventsClient: {
            brokers,
            clientId: AppsNames.X1000,
          },
          streamingEventsClient: {
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
export class X1000Module {}
