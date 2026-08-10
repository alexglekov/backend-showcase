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
import { AppsNames } from '@xyro/core';
import { EventsModule } from '@xyro/libs/events';

import { Config, configLoader, envValidator } from './infrastructure/config';
import { PrismaModule } from './infrastructure/prisma';

import { PricesReaderModule } from './modules/reader/reader.module';
import { PriceProvidersModule } from './modules/price-providers/providers.module';
import { PricesWriterModule } from './modules/writer/writer.module';

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
      useStreamingEventsMode: true,
      useFactory: (configService: ConfigService<Config>) => {
        const { brokers } = configService.get('kafka');
        const { host, port } = configService.get('redis');

        return {
          domainEventsClient: {
            brokers,
            clientId: AppsNames.Prices,
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

    PricesReaderModule,
    PriceProvidersModule,
    PricesWriterModule,
  ],
  providers: [],
})
export class PricesModule {}
