import { InjectionToken } from '@nestjs/common';
import { StorageModuleOptions } from './storage.options';

export interface StorageModuleAsyncOptions {
  imports?: Array<any>;
  inject?: Array<InjectionToken>;
  useFactory: (...args: any[]) => StorageModuleOptions;
}
