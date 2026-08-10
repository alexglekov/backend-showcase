import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { RedisModule } from '@xyro/libs/redis';
import { LedgerModule } from '@xyro/libs/ledger';
import { LoggerModule } from '@xyro/libs/logger';
import { APP_GUARD } from '@nestjs/core';

import { VoidScalar } from '@xyro/libs/graphql';

import { AuthModule } from './modules/auth/auth.module';
import { IamModule } from './modules/iam/iam.module';
import { UsersModule } from './modules/users/users.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { GrpcModule } from './infrastructure/grpc';
import { Config, configLoader, envValidator } from './infrastructure/config';
import { PrismaModule } from './infrastructure/prisma';
import { AuthenticationMiddleware } from './modules/auth/middlewares/authentication.middleware';
import { WalletsModule } from './modules/wallets/wallets.module';
import { EventBusModule } from './infrastructure/pub-sub';

import { PermissionGuard } from './modules/iam/permissions';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    LoggerModule.forRoot(),
    LedgerModule.forRoot(false),
    ConfigModule.forRoot({
      isGlobal: true,
      validate: envValidator,
      load: configLoader,
    }),
    EventBusModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: {
        settings: {
          'request.credentials': 'include',
        },
      },
      context: (context: any) => {
        return {
          req: context.connectionInitReceived
            ? context.extra.request
            : context.req,
          res: context.res,
          dataLoaders: new WeakMap(),
        };
      },
      subscriptions: {
        'graphql-ws': {
          path: '/graphql/subscriptions',
        },
      },
    }),
    GrpcModule.forRootAsync({
      useFactory: (config: ConfigService<Config>) => {
        const { analytics, users } = config.get('grpc');

        return {
          analytics,
          users,
        };
      },
      inject: [ConfigService],
    }),
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory(config: ConfigService<Config>) {
        const { host, port, keyPrefix } = config.get('redis');

        return {
          keyPrefix,
          host,
          port,
          lazyConnect: true,
        };
      },
    }),
    PrismaModule,

    AuthModule,
    IamModule,
    UsersModule,
    PaymentsModule,
    WalletsModule,
    DashboardModule,
  ],
  providers: [
    VoidScalar,
    {
      provide: APP_GUARD,
      useClass: AuthenticationMiddleware, // middleware, extract session from request
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard, // middleware, check permission to request data
    },
  ],
})
export class BackofficeModule {}
