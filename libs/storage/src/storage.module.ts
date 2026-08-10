import { DynamicModule, Global, Module } from '@nestjs/common';
import { LoggerModule } from '@xyro/libs/logger';

import { AwsStorageServiceAdapter } from './awsStorage.service-adapter';
import { StorageModuleAsyncOptions } from './interfaces/storageAsync.options';
import { StorageService } from './storage.service-port';
import { STORAGE_MODULE_CONFIG_TOKEN } from './tokens';

@Module({})
@Global()
export class StorageModule {
  public static forRootAsync(
    options: StorageModuleAsyncOptions,
  ): DynamicModule {
    return {
      module: StorageModule,
      imports: [
        ...(options.imports || []),
        LoggerModule.forRoot(),
      ],
      exports: [StorageService],
      providers: [
        {
          provide: STORAGE_MODULE_CONFIG_TOKEN,
          useFactory: options.useFactory,
          inject: options.inject,
        },
        {
          provide: StorageService,
          useClass: AwsStorageServiceAdapter,
        },
      ],
    };
  }
}
