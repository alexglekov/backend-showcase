import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { DateScalar } from '@xyro/libs/graphql';
import { LedgerModule } from '@xyro/libs/ledger';
import { LoggerModule } from '@xyro/libs/logger';
import { EventsModule } from '@xyro/libs/events';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';
import { AppsNames } from '@xyro/core';

import { PrismaModule } from './infrastructure/prisma';
import { Config, configLoader, envValidator } from './infrastructure/config';
import { GrpcModule } from './infrastructure/transports';
import { OneVsOneGameModule } from './module/game/oneVsOneGame.module';
import { OneVsOneBetsModule } from './module/bets/oneVsOneBet.module';
import { CacheModule } from './module/cache/cache.module';

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
      context: ({ req, res }: { req: Request; res: Response }) => ({ req, res }),
      autoSchemaFile: {
        federation: 2,
      },
      buildSchemaOptions: {
        orphanedTypes: [UserGraphQLOrphanEntity],
      },
    }),
    GrpcModule.forRootAsync({
      useFactory: (config: ConfigService<Config>) => {
        const { prices } = config.get('grpc');
        
        return {
          prices: prices,
        }
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
            clientId: AppsNames.OneVsOne,
          }
        }
      },
      inject: [ConfigService],
    }),
    CacheModule,
    OneVsOneGameModule,
    OneVsOneBetsModule,
    PrismaModule,
  ],
  providers: [
    DateScalar,
  ],
})
export class OneVsOneModule {}
