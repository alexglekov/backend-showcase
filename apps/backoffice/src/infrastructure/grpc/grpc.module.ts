import { DynamicModule, Global, Module } from '@nestjs/common';
import { ClientGrpc, ClientsModule, Transport } from '@nestjs/microservices';
import { AnalyticsService } from '@xyro/contracts/analytics';
import { UsersService } from '@xyro/contracts/users';
import { AppsNames } from '@xyro/core';

import { GrpcModuleAsyncOptions, GrpcModuleOptions } from './grpc.interfaces';
import {
  GRPC_ANALYTICS_SERVICE_URL,
  GRPC_MODULE_OPTIONS_TOKEN,
  GRPC_USERS_SERVICE_TOKEN,
} from './constants';

@Global()
@Module({})
export class GrpcModule {
  static forRootAsync(options: GrpcModuleAsyncOptions): DynamicModule {
    return {
      module: GrpcModule,
      imports: [
        ...(options.imports || []),
        ClientsModule.registerAsync({
          clients: [
            {
              name: GRPC_USERS_SERVICE_TOKEN,
              useFactory: (options: GrpcModuleOptions) => ({
                transport: Transport.GRPC,
                options: {
                  package: options.users.package,
                  url: options.users.url,
                  protoPath: options.users.protoPath,
                },
              }),
              inject: [GRPC_MODULE_OPTIONS_TOKEN],
            },
            {
              name: GRPC_ANALYTICS_SERVICE_URL,
              useFactory: (options: GrpcModuleOptions) => ({
                transport: Transport.GRPC,
                options: {
                  package: options.analytics.package,
                  url: options.analytics.url,
                  protoPath: options.analytics.protoPath,
                },
              }),
              inject: [GRPC_MODULE_OPTIONS_TOKEN],
            },
          ],
        }),
      ],
      providers: [
        {
          provide: GRPC_MODULE_OPTIONS_TOKEN,
          useFactory: options.useFactory,
          inject: options.inject,
        },
        {
          provide: AppsNames.Users,
          useFactory: (client: ClientGrpc) => {
            return client.getService<UsersService>('UsersService');
          },
          inject: [GRPC_USERS_SERVICE_TOKEN],
        },
        {
          provide: AppsNames.Analytics,
          useFactory: (client: ClientGrpc) => {
            return client.getService<AnalyticsService>('AnalyticsService');
          },
          inject: [GRPC_ANALYTICS_SERVICE_URL],
        },
      ],
      exports: [
        AppsNames.Analytics,
        AppsNames.Users,
        GRPC_MODULE_OPTIONS_TOKEN,
      ],
      global: true,
    };
  }
}
