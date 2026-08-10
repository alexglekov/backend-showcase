import { DynamicModule, Global, Module } from '@nestjs/common';
import { ClientGrpc, ClientsModule, Transport } from '@nestjs/microservices';
import { LedgerService } from '@xyro/contracts/ledger';
import { UsersService } from '@xyro/contracts/users';
import { MessengerService } from '@xyro/contracts/messenger';
import { AppsNames } from '@xyro/core';
import { TwitterService } from '@xyro/contracts/twitter';

import { GrpcModuleAsyncOptions, GrpcModuleOptions } from './grpc.interfaces';
import {
  GRPC_LEDGER_SERVICE_TOKEN,
  GRPC_MESSENGER_SERVICE_TOKEN,
  GRPC_MODULE_OPTIONS_TOKEN,
  GRPC_TWITTER_SERVICE_TOKEN,
  GRPC_USERS_SERVICE_TOKEN
} from './constants';

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
                name: GRPC_MESSENGER_SERVICE_TOKEN,
                useFactory: (options: GrpcModuleOptions) => ({
                  transport: Transport.GRPC,
                  options: {
                    package: options.messenger.package,
                    url: options.messenger.url,
                    protoPath: options.messenger.protoPath,
                  }
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
                name: GRPC_TWITTER_SERVICE_TOKEN,
                useFactory: (options: GrpcModuleOptions) => ({
                  transport: Transport.GRPC,
                  options: {
                    package: options.twitter.package,
                    url: options.twitter.url,
                    protoPath: options.twitter.protoPath,
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
          provide: AppsNames.Messenger,
          useFactory: (client: ClientGrpc) => {
            return client.getService<MessengerService>('MessengerService');
          },
          inject: [GRPC_MESSENGER_SERVICE_TOKEN],
        },
        {
          provide: AppsNames.Ledger,
          useFactory: (client: ClientGrpc) => {
            return client.getService<LedgerService>('LedgerService');
          },
          inject: [GRPC_LEDGER_SERVICE_TOKEN],
        },
        {
          provide: AppsNames.Twitter,
          useFactory: (client: ClientGrpc) => {
            return client.getService<TwitterService>('TwitterService');
          },
          inject: [GRPC_TWITTER_SERVICE_TOKEN],
        }
      ],
      exports: [AppsNames.Users, AppsNames.Twitter, AppsNames.Ledger, AppsNames.Messenger, GRPC_MODULE_OPTIONS_TOKEN],
      global: true,
    }
  }
}
