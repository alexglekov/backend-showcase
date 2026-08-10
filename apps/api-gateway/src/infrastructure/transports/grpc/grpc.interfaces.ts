import { InjectionToken } from '@nestjs/common';

interface GrpcConnectionOptions {
  url: string;
  package: string;
  protoPath: string;
}

export type GrpcModuleOptions = {
  users: GrpcConnectionOptions;
  ledger: GrpcConnectionOptions;
  bullsEye: GrpcConnectionOptions;
  analytics: GrpcConnectionOptions;
}

export  type GrpcModuleAsyncOptions = {
  imports?: Array<any>;
  inject?: Array<InjectionToken>;
  useFactory: (...args: any[]) => GrpcModuleOptions;
}
