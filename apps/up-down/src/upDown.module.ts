import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { DateScalar } from '@xyro/libs/graphql';
import { LoggerModule } from '@xyro/libs/logger';
import { EventsModule } from '@xyro/libs/events';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';
import { AppsNames } from '@xyro/core';
import { RedisModule } from '@xyro/libs/redis';

import { PrismaModule } from './infrastructure/prisma';
import { Config, configLoader, envValidator } from './infrastructure/config';
import { UpDownGameModule } from './module/game/up-down.module';
import { UpDownBetsModule } from './module/bets/upDownBet.module';

@Module({
  imports: [
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
        orphanedTypes: [UserGraphQLOrphanEntity],
      },
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
          streamingEventsClient: {
            host,
            port,
          },
          domainEventsClient: {
            brokers,
            clientId: AppsNames.UpDown,
          },
        }
      },
      inject: [ConfigService],
    }),
    UpDownGameModule,
    UpDownBetsModule,
    PrismaModule,
  ],
  providers: [
    DateScalar,
  ],
})
export class UpDownModule {}
