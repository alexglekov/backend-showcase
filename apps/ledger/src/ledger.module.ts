import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LedgerModule } from '@xyro/libs/ledger';
import { LoggerModule } from '@xyro/libs/logger';
import { EventsModule } from '@xyro/libs/events';
import { DateScalar, VoidScalar } from '@xyro/libs/graphql';
import { AppsNames } from '@xyro/core';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';

import { Config, configLoader, envValidator } from './infrastructure/config';
import { PrismaModule } from './infrastructure/prisma';
import { WalletsModule } from './modules/wallet/wallet.module';
import { AccountsModule } from './modules/account/accounts.module';
import { GamesRewardsModule } from './modules/games-rewards/gamesRewards.module';

@Module({
  imports: [
    LoggerModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validate: envValidator,
      load: configLoader,
    }),
    LedgerModule.forRoot(),
    EventsModule.forRootAsync({
      useDomainEventsMode: true,
      useFactory: (configService: ConfigService<Config>) => {
        const { brokers } = configService.get('kafka');

        return {
          domainEventsClient: {
            brokers,
            clientId: AppsNames.Ledger,
          }
        }
      },
      inject: [ConfigService],
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
    PrismaModule,

    WalletsModule,
    AccountsModule,
    GamesRewardsModule,
  ],
  providers: [
    DateScalar,
    VoidScalar,
  ]
})
export class LedgerServiceModule {}
