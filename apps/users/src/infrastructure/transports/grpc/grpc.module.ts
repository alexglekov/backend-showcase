import { DynamicModule, Global, Module } from '@nestjs/common';
import { ClientGrpc, ClientsModule, Transport } from '@nestjs/microservices';
import { AppsNames } from '@xyro/core';

import { GrpcModuleAsyncOptions, GrpcModuleOptions } from './grpc.interfaces';
import {
  GRPC_MODULE_OPTIONS_TOKEN,
  GRPC_TWITTER_SERVICE_TOKEN,
} from './constants';
import { TwitterService } from '@xyro/contracts/twitter';

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
              },
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
          provide: AppsNames.Twitter,
          useFactory: (client: ClientGrpc) => {
            return client.getService<TwitterService>('TwitterService');
          },
          inject: [GRPC_TWITTER_SERVICE_TOKEN],
        }
      ],
      exports: [AppsNames.Twitter, GRPC_MODULE_OPTIONS_TOKEN],
      global: true,
    }
  }
}
