import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { DateScalar, VoidScalar } from '@xyro/libs/graphql';
import { LoggerModule } from '@xyro/libs/logger';
import { RedisModule } from '@xyro/libs/redis';
import { EventsModule } from '@xyro/libs/events';
import { AppsNames } from '@xyro/core';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';
import { LedgerModule } from '@xyro/libs/ledger';

import { PrismaModule } from './infrastructure/prisma';
import { configLoader, envValidator, Config } from './infrastructure/config';
import { GrpcModule } from './infrastructure/transports';
import { SetupGameModule } from './module/games/setupGame.module';
import { SetupBetModule } from './module/bets/setupBet.module';
import { DataLoaderModule } from './module/dataloaders/dataloadersModule';

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
        const { users, prices } = config.get('grpc');

        return {
          prices,
          users,
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
            clientId: AppsNames.Setups,
          }
        }
      },
      inject: [ConfigService],
    }),
    PrismaModule,
    LedgerModule.forRoot(false),

    SetupGameModule,
    SetupBetModule,
    DataLoaderModule,
  ],
  providers: [
    DateScalar,
    VoidScalar,
  ],
})
export class SetupsModule {}
