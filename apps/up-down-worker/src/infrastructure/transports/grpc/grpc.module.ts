import { DynamicModule, Global, Module } from '@nestjs/common';
import { ClientGrpc, ClientsModule, Transport } from '@nestjs/microservices';
import { PricesService } from '@xyro/contracts/prices';
import { AppsNames } from '@xyro/core';

import { GrpcModuleAsyncOptions, GrpcModuleOptions } from './grpc.interfaces';
import { GRPC_MODULE_OPTIONS_TOKEN, GRPC_PRICES_SERVICE_TOKEN } from './constants';

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
            clients: [{
              name: GRPC_PRICES_SERVICE_TOKEN,
              useFactory: (options: GrpcModuleOptions) => ({
                transport: Transport.GRPC,
                options: {
                  package: options.prices.package,
                  url: options.prices.url,
                  protoPath: options.prices.protoPath,
                },
              }),
              inject: [GRPC_MODULE_OPTIONS_TOKEN],
            }],
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
          provide: AppsNames.Prices,
          useFactory: (client: ClientGrpc) => {
            return client.getService<PricesService>('PricesService');
          },
          inject: [GRPC_PRICES_SERVICE_TOKEN],
        }
      ],
      exports: [AppsNames.Prices, GRPC_MODULE_OPTIONS_TOKEN],
      global: true,
    }
  }
}