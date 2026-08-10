import { InjectionToken } from '@nestjs/common';
import { ColumnOrientedDatabaseModuleOptions } from './options';

export interface ColumnOrientedDatabaseModuleAsyncOptions {
  imports?: Array<any>;
  inject?: Array<InjectionToken>;
  useFactory: (...args: any[]) => ColumnOrientedDatabaseModuleOptions;
}
