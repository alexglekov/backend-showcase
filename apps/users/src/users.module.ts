import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { Request, Response } from 'express';
import { RedisModule } from '@xyro/libs/redis';
import { LedgerModule } from '@xyro/libs/ledger';
import { StorageModule } from '@xyro/libs/storage';
import { DateScalar, VoidScalar } from '@xyro/libs/graphql';
import { LoggerModule } from '@xyro/libs/logger';
import { EventsModule } from '@xyro/libs/events';
import { AppsNames } from '@xyro/core';

import { Config, configLoader, envValidator } from './infrastructure/config';
import { PrismaModule } from './infrastructure/prisma';
import { UsersModule } from './modules/users';
import { NotificationsPolicyModule } from './modules/notifications-policy/notification-policy.module';
import { PrivacyModule } from './modules/privacy/privacy.module';
import { AuthModule } from './modules/auth/auth.module';
import { PaymentModule } from './modules/payment/payment.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { GrpcModule } from './infrastructure/transports';
import { TwitterAccountGraphQLOrphanEntity } from '@xyro/contracts/twitter';

@Module({
  imports: [
    GrpcModule.forRootAsync({
      useFactory: (config: ConfigService<Config>) => {
        const { twitter } = config.get('grpc');

        return {
          twitter,
        }
      },
      inject: [ConfigService],
    }),
    LoggerModule.forRoot(),
    StorageModule.forRootAsync({
      inject: [ConfigService<Config>],
      useFactory: (config: ConfigService<Config>) => {
        const { accessKeyId, bucket, endpoint, expiresIn, region, secretAccessKey, s3storageType } = config.get('storage');

        return {
          acl: 'private',
          bucketName: bucket,
          endpoint: s3storageType !== 'aws' ? endpoint : undefined,
          apiVersion: 'latest',
          credentials: {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
          },
          region: region,
          forcePathStyle: s3storageType !== 'aws', // for MINIO
          expiresIn: expiresIn,
        };
      },
    }),
    LedgerModule.forRoot(),
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
      useFactory: (configService: ConfigService<Config>) => {
        const { brokers } = configService.get('kafka');

        return {
          domainEventsClient: {
            brokers,
            clientId: AppsNames.Users,
          },
        }
      },
      inject: [ConfigService],
    }),
    PrismaModule,

    UsersModule,
    NotificationsPolicyModule,
    PrivacyModule,
    AuthModule,
    PaymentModule,
    SessionsModule,
    ReferralsModule,

    // scalars
    DateScalar,
    VoidScalar,
  ],
})
export class UsersAndAuthModule {}
