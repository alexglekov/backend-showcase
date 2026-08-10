import { Module } from '@nestjs/common';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { DateScalar } from '@xyro/libs/graphql';
import { Environment, HttpHeaders } from '@xyro/core';
import { parseCookies } from '@xyro/libs/utils';
import { IncomingMessage } from 'http';
import { ConfigService } from '@nestjs/config';
import { buildSchema, printSchema } from 'graphql';
import { mergeSchemas } from '@graphql-tools/schema';
import { GraphQLFormattedError } from 'graphql';

import { HealthcheckResolver } from './healthcheck';
import { UpDownModule } from './up-down/upDown.module';
import { PricesModule } from './prices/prices.module';
import { OneVsOneModule } from './one-vs-one/oneVsOne.module';
import { MessengerModule } from './messenger/messenger.module';
import { LedgerEventsModule } from './ledger/ledger.module';
import { UsersModule } from './users/users.module';
import { Config, clientConfig } from '../../infrastructure/config';
import { AuthenticationService } from '../../infrastructure/authentication';
import { NotificationsModule } from './notifications/notifications.module';
import { SetupModule } from './setup/setup.module';
import { X1000Module } from './x1000/x1000.module';
import { SchemaRegistryService } from '../../infrastructure/third-party';
import { AnalyticsModule } from './analytics/analytics.module';
import { OnlineCounterService } from '../online-counter';
import { BullsEyeModule } from './bulls-eye/bullsEye.module';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [SubscriptionsModule],
      inject: [
        ConfigService<Config>,
        AuthenticationService,
        OnlineCounterService,
        SchemaRegistryService,
      ],
      useFactory: (
        configService: ConfigService<Config>,
        authService: AuthenticationService,
        onlineCounterService: OnlineCounterService,
        schemaRegistryService: SchemaRegistryService,
      ) => ({
        installSubscriptionHandlers: true,
        playground: {
          settings: {
            'request.credentials': 'include',
          },
        },
        formatError(formattedError: GraphQLFormattedError, error): any {
          const { env } = configService.get('app');

          return {
            code: formattedError?.extensions?.code,
            message: formattedError?.extensions?.message || 'Internal server error...',
            path: formattedError.path,
            extensions: env === Environment.development ? formattedError.extensions : undefined,
          };
        },
        path: '/subscription',
        context: async (context: any) => {
          return ({ req: context.connectionInitReceived ? context.extra.request : context.req, res: context.res, dataLoaders: new WeakMap() })
        },
        autoSchemaFile: true,
        async transformSchema(schema) {
          const { subscriptionsSchema } = configService.get('graphql');

          const schemaWithDirectives = buildSchema(`directive @key(fields: String) on OBJECT ` + printSchema(schema)) as any

          (schema as any)._directives = schemaWithDirectives._directives;

          if (!subscriptionsSchema) return schema;

          const federatedSchema = await schemaRegistryService.fetchSchema();

          const mergedSchema = mergeSchemas({
            schemas: [
              buildSchema(federatedSchema),
              schema,
            ],
          });

          return mergedSchema;
        },
        subscriptions: {
          'graphql-ws': {
            path: '/subscription',
            async onDisconnect({ extra }) {
              const { socket } = extra as { request: IncomingMessage, socket: any };

              await onlineCounterService.unregistConnection(socket._socket.remoteAddress);
            },
            async onConnect({ extra }) {
              const { request, socket } = extra as { request: IncomingMessage, socket: any };

              await onlineCounterService.registConnection(socket._socket.remoteAddress);

              const cookie = request.headers.cookie;
              const cookies = parseCookies(cookie || '');

              if (!cookies) return;

              request.headers[HttpHeaders.userAgent] = request.headers['user-agent'];
              request.headers[HttpHeaders.userIp] = socket._socket.remoteAddress;

              const token = cookies[clientConfig.cookies.refreshToken];
              const sessionId = cookies[clientConfig.cookies.sessionId];

              if (!sessionId) return;

              const tokenPayload = await authService.getSessionById(sessionId);

              if (!tokenPayload) return;

              request.headers[HttpHeaders.userId] = tokenPayload.userId;
              request.headers[HttpHeaders.refreshToken] = token;
              request.headers[HttpHeaders.sessionId] = sessionId;
            },
          },
        },
      }),
    }),
    SetupModule,
    UpDownModule,
    OneVsOneModule,
    X1000Module,
    BullsEyeModule,
    PricesModule,
    UsersModule,
    MessengerModule,
    AnalyticsModule,
    LedgerEventsModule,
    NotificationsModule,
  ],
  providers: [
    DateScalar,
    HealthcheckResolver,
  ],
  exports: [UsersModule],
})
export class SubscriptionsModule {}
