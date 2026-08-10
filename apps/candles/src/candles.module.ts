import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Request, Response } from 'express';
import { auth as cassandraDriverAuth } from 'cassandra-driver';
import { RedisModule } from '@xyro/libs/redis';
import { ColumnOrientedDatabase } from '@xyro/libs/columnDb';
import { LoggerModule } from '@xyro/libs/logger';
import { EventsModule } from '@xyro/libs/events';
import { AppsNames } from '@xyro/core';

import { Config, configLoader, envValidator } from './infrastructure/config';
import { PrismaModule } from './infrastructure/prisma';
import { CandlesModule } from './modules/candles/candles.module';
import { DateScalar } from '@xyro/libs/graphql';

@Module({
  imports: [
    LoggerModule.forRoot(),
    ColumnOrientedDatabase.forRootAsync({
      inject: [ConfigService],
      useFactory(config: ConfigService<Config>) {
        const {
          keyspacesName,
          accessKey,
          endpoint,
          region,
          secretAccessKey,
          storageType,
          ca,
          port,
        } = config.get('cassandra');

        return {
          namespace: keyspacesName,
          storageType,
          contactPoints: [endpoint],
          localDataCenter: region,
          authProvider: new cassandraDriverAuth.PlainTextAuthProvider(
            accessKey,
            secretAccessKey
          ),
          sslOptions:
            storageType === 'aws'
              ? {
                  ca: [ca!],
                  host: endpoint,
                  rejectUnauthorized: true,
                }
              : undefined,
          protocolOptions: storageType === 'aws' ? { port } : undefined,
        };
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
    EventsModule.forRootAsync({
      useDomainEventsMode: true,
      useFactory: (configService: ConfigService<Config>) => {
        const { brokers } = configService.get('kafka');

        return {
          domainEventsClient: {
            brokers,
            clientId: AppsNames.Candles,
          }
        };
      },
      inject: [ConfigService],
    }),
    PrismaModule,

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
        orphanedTypes: [],
      },
    }),
    ScheduleModule.forRoot(),

    CandlesModule,
  ],
  providers: [DateScalar],
})
export class CandleModule {}
