import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { Request, Response } from 'express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventsModule } from '@xyro/libs/events';
import { AppsNames } from '@xyro/core';
import { LoggerModule } from '@xyro/libs/logger';
import { RedisModule } from '@xyro/libs/redis';
import { ScheduleModule } from '@nestjs/schedule';

import { Config, configLoader, envValidator } from './infrastructure/config';
import { PrismaModule } from './infrastructure/prisma';
import { TwitterAuthModule } from './modules/twitter-auth/twitterAuth.module';
import { TwitterUsersModule } from './modules/twitter-users/twitterUsers.module';
import { TweetsModule } from './modules/tweets/tweets.module';
import { TwitterIndexerModule } from './modules/twitter-indexer/twitterIndexer.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    LoggerModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validate: envValidator,
      load: configLoader,
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      playground: true,
      csrfPrevention: false,
      context: ({ req, res }: { req: Request; res: Response }) => ({ req, res }),
      autoSchemaFile: {
        federation: 2,
      },
      buildSchemaOptions: {
        orphanedTypes: [],
      },
    }),
    EventsModule.forRootAsync({
      useDomainEventsMode: true,
      useFactory: (configService: ConfigService<Config>) => {
        const { brokers } = configService.get('kafka');

        return {
          domainEventsClient: {
            brokers,
            clientId: AppsNames.Twitter,
          }
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
    PrismaModule,


    TwitterAuthModule,
    TwitterUsersModule,
    TweetsModule,
    TwitterIndexerModule,
  ],
})
export class TwitterModule {}
