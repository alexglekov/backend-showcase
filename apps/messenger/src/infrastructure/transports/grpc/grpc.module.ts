import { DynamicModule, Global, Module } from '@nestjs/common';
import { ClientGrpc, ClientsModule, Transport } from '@nestjs/microservices';
import { UsersService } from '@xyro/contracts/users';
import { AppsNames } from '@xyro/core';

import { GrpcModuleAsyncOptions, GrpcModuleOptions } from './grpc.interfaces';
import { GRPC_MODULE_OPTIONS_TOKEN, GRPC_LEDGER_SERVICE_TOKEN } from './constants';
import { LedgerService } from '@xyro/contracts/ledger';

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
          provide: AppsNames.Ledger,
          useFactory: (client: ClientGrpc) => {
            return client.getService<LedgerService>('LedgerService');
          },
          inject: [GRPC_LEDGER_SERVICE_TOKEN],
        }
      ],
      exports: [AppsNames.Ledger, GRPC_MODULE_OPTIONS_TOKEN],
      global: true,
    }
  }
}