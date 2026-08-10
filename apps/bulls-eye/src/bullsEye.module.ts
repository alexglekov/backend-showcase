import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { DateScalar } from '@xyro/libs/graphql';
import { LoggerModule } from '@xyro/libs/logger';
import { EventsModule } from '@xyro/libs/events';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';
import { RedisModule } from '@xyro/libs/redis';
import { AppsNames } from '@xyro/core';

import { PrismaModule } from './infrastructure/prisma';
import { Config, configLoader, envValidator } from './infrastructure/config';
import { BullsEyeGameModule } from './module/game/bullsEye.module';
import { BullsEyeBetsModule } from './module/bets/bullsEyeBet.module';

@Module({
  imports: [
    LoggerModule.forRoot(),
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
    EventsModule.forRootAsync({
      useDomainEventsMode: true,
      useStreamingEventsMode: true,
      useFactory: (configService: ConfigService<Config>) => {
        const { brokers } = configService.get('kafka');
        const { host, port } = configService.get('redis');

        return {
          domainEventsClient: {
            brokers,
            clientId: AppsNames.BullsEye
          },
          streamingEventsClient: {
            host,
            port,
          }
        }
      },
      inject: [ConfigService],
    }),
    BullsEyeGameModule,
    BullsEyeBetsModule,
    PrismaModule,
  ],
  providers: [
    DateScalar,
  ],
})
export class BullsEyeModule {}
