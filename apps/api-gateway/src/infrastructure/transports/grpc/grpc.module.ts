import { DynamicModule, Global, Module } from '@nestjs/common';
import { ClientGrpc, ClientsModule, Transport } from '@nestjs/microservices';
import { UsersService } from '@xyro/contracts/users';
import { BullsEyeService } from '@xyro/contracts/bulls-eye';
import { AppsNames } from '@xyro/core';

import { GrpcModuleAsyncOptions, GrpcModuleOptions } from './grpc.interfaces';
import {
  GRPC_MODULE_OPTIONS_TOKEN,
  GRPC_USERS_SERVICE_TOKEN,
  GRPC_BULLS_EYE_SERVICE_TOKEN,
  GRPC_LEDGER_SERVICE_TOKEN,
  GRPC_ANALYTICS_SERVICE_TOKEN
} from './constants';
import { LedgerService } from '@xyro/contracts/ledger';
import { AnalyticsService } from '@xyro/contracts/analytics';

@Global()
@Module({})
export class GrpcModule {
  static forRootAsync(options: GrpcModuleAsyncOptions): DynamicModule {
    return {
      module: GrpcModule,
      imports: [
        ...(options.imports || []),
        ClientsModule.registerAsync(
          {
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
                name: GRPC_LEDGER_SERVICE_TOKEN,
                useFactory: (options: GrpcModuleOptions) => ({
                  transport: Transport.GRPC,
                  options: {
                    package: options.ledger.package,
                    url: options.ledger.url,
                    protoPath: options.ledger.protoPath,
                  },
                }),
                inject: [GRPC_MODULE_OPTIONS_TOKEN],
              },
              {
                name: GRPC_BULLS_EYE_SERVICE_TOKEN,
                useFactory: (options: GrpcModuleOptions) => ({
                  transport: Transport.GRPC,
                  options: {
                    package: options.bullsEye.package,
                    url: options.bullsEye.url,
                    protoPath: options.bullsEye.protoPath,
                  },
                }),
                inject: [GRPC_MODULE_OPTIONS_TOKEN],
              },
              {
                name: GRPC_ANALYTICS_SERVICE_TOKEN,
                useFactory: (options: GrpcModuleOptions) => ({
                  transport: Transport.GRPC,
                  options: {
                    package: options.analytics.package,
                    url: options.analytics.url,
                    protoPath: options.analytics.protoPath,
                  },
                }),
                inject: [GRPC_MODULE_OPTIONS_TOKEN],
              }
            ],
          }
        ),
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
          provide: AppsNames.BullsEye,
          useFactory: (client: ClientGrpc) => {
            return client.getService<BullsEyeService>('BullsEyeService');
          },
          inject: [GRPC_BULLS_EYE_SERVICE_TOKEN],
        },
        {
          provide: AppsNames.Analytics,
          useFactory: (client: ClientGrpc) => {
            return client.getService<AnalyticsService>('AnalyticsService');
          },
          inject: [GRPC_ANALYTICS_SERVICE_TOKEN],
        },
        {
          provide: AppsNames.Ledger,
          useFactory: (client: ClientGrpc) => {
            return client.getService<LedgerService>('LedgerService');
          },
          inject: [GRPC_LEDGER_SERVICE_TOKEN],
        }
      ],
      exports: [
        AppsNames.Users,
        AppsNames.Analytics,
        AppsNames.Ledger,
        AppsNames.BullsEye,
        GRPC_MODULE_OPTIONS_TOKEN
      ],
      global: true,
    }
  }
}