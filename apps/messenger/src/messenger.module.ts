import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DateScalar, MarkdownScalar } from '@xyro/libs/graphql';
import { LoggerModule } from '@xyro/libs/logger';
import { EventsModule } from '@xyro/libs/events';
import { AppsNames } from '@xyro/core';

import { Config, configLoader, envValidator } from './infrastructure/config';
import { GrpcModule } from './infrastructure/transports';
import { PrismaModule } from './infrastructure/prisma';
import { MessageGraphQLEntityResolver } from './application/resolvers/messageGraphQLEntity.resolver';
import { MessengerService } from './application/messenger.service';
import { MessengerResolver } from './application/resolvers/messenger.resolver';
import { MessengerController } from './application/messenger.controller';
import { RoomGraphQLEntityResolver } from './application/resolvers/roomGraphQLEntity.resolver';

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
    GrpcModule.forRootAsync({
      useFactory: (config: ConfigService<Config>) => {
        const { ledger } = config.get('grpc');

        return {
          ledger,
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
            clientId: AppsNames.Messenger,
          }
        }
      },
      inject: [ConfigService],
    }),
    PrismaModule,
  ],
  providers: [
    DateScalar,
    MarkdownScalar,

    MessengerService,
    MessengerResolver,

    MessageGraphQLEntityResolver,
    RoomGraphQLEntityResolver,
  ],
  controllers: [
    MessengerController
  ],
})
export class MessengerModule {}