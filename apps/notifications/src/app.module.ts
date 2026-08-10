import { Module } from '@nestjs/common';
import { GamesNotificationsModule } from './modules/games/gamesNotifications.module';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { LoggerModule } from '@xyro/libs/logger';
import { DateScalar, VoidScalar } from '@xyro/libs/graphql';
import { AppsNames } from '@xyro/core';
import { EventsModule } from '@xyro/libs/events';

import { PrismaModule } from './infrastructure/prisma';
import { Config, configLoader, envValidator } from './infrastructure/config';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EmailNotificationsModule } from './modules/email-notifications/emailNotifications.module';
import { InboundNotificationsModule } from './modules/inbound-notifications/inboundNotifications.module';

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
            clientId: AppsNames.Notifications,
          }
        }
      },
      inject: [ConfigService],
    }),
    PrismaModule,
    GamesNotificationsModule,
    InboundNotificationsModule,
    NotificationsModule,
    EmailNotificationsModule,
  ],
  providers: [
    DateScalar,
    VoidScalar,
  ]
})
export class NotificationsAppModule {}