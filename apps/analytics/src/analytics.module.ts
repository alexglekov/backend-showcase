import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';

import { RedisModule } from '@xyro/libs/redis';
import { SchedulerModule } from '@xyro/libs/scheduler';
import { LedgerModule } from '@xyro/libs/ledger';
import { DateScalar, VoidScalar } from '@xyro/libs/graphql';
import { LoggerModule } from '@xyro/libs/logger';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';
import { X1000BetGraphQLOrphanEntity } from '@xyro/contracts/x1000';
import { EventsModule } from '@xyro/libs/events';
import { AppsNames } from '@xyro/core';

import { Config, configLoader, envValidator } from './infrastructure/config';
import { PrismaModule } from './infrastructure/prisma';
import { PlatformStaticsticModule } from './modules/platform-staticstic/platformStaticstic.module';
import { UserStatisticModule } from './modules/user-statistic/userStatistic.module';
import { SetupsStaticsticModule } from './modules/setups-staticstic/setupsStaticstic.module';
import { FeatureX1000StatisticModule } from './modules/feature-x1000-statistic/featureX1000Statistic.module';
import { BetsModule } from './modules/bets/bets.module';
import { LiveStreamsModule } from './modules/live-streams/liveStreams.module';
import { RewardsModule } from './modules/rewards';
import { GrpcModule } from './infrastructure/transports';
import { AirdropRewardsModule } from './modules/airdrop-rewards/airdropRewardsModule';
import { NftSyncModule } from './modules/nft-sync/nftSync.module';
import { ReferralRewardsModule } from './modules/referral-rewards/referralRewards.module';

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
        orphanedTypes: [UserGraphQLOrphanEntity, X1000BetGraphQLOrphanEntity],
      },
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
    EventsModule.forRootAsync({
      useDomainEventsMode: true,
      useFactory: (configService: ConfigService<Config>) => {
        const { brokers } = configService.get('kafka');

        return {
          domainEventsClient: {
            brokers,
            clientId: AppsNames.Analytics,
          },
        };
      },
      inject: [ConfigService],
    }),
    PrismaModule,
    GrpcModule.forRootAsync({
      useFactory: (config: ConfigService<Config>) => {
        const { users, ledger, messenger, twitter } = config.get('grpc');

        return { users, ledger, messenger, twitter };
      },
      inject: [ConfigService],
    }),

    BetsModule,
    NftSyncModule,
    SetupsStaticsticModule,
    FeatureX1000StatisticModule,
    PlatformStaticsticModule,
    UserStatisticModule,
    ReferralRewardsModule,
    LiveStreamsModule,
    RewardsModule,
    AirdropRewardsModule,
  ],
  providers: [
    DateScalar,
    VoidScalar,
  ],
})
export class AnalyticsAppModule {}
