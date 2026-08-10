import { DynamicModule, Global, Module } from '@nestjs/common';

import { AssetService } from './port';
import { AssetServiceAdapter } from './adapter';
import { ColumnOrientedDatabaseModuleAsyncOptions } from './interfaces/async.options';
import { COLUMN_ORIENTED_DATABASE_OPTIONS } from './tokens';

@Module({
  providers: [
    {
      provide: AssetService,
      useClass: AssetServiceAdapter,
    },
  ],
  exports: [AssetService],
})
@Global()
export class ColumnOrientedDatabase {
  public static forRootAsync(
    options: ColumnOrientedDatabaseModuleAsyncOptions
  ): DynamicModule {
    return {
      module: ColumnOrientedDatabase,
      imports: options.imports,
      exports: [AssetService],
      providers: [
        {
          provide: COLUMN_ORIENTED_DATABASE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject,
        },
        {
          provide: AssetService,
          useClass: AssetServiceAdapter,
        },
      ],
    };
  }
}
