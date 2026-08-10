import { InjectionToken } from '@nestjs/common';
import { RedisModuleOptions } from './redis.options';

export interface RedisModuleAsyncOptions {
  imports?: Array<any>;
  inject?: Array<InjectionToken>;
  useFactory: (...args: any[]) => RedisModuleOptions;
}
