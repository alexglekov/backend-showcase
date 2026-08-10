import { InjectionToken } from '@nestjs/common';

interface GrpcServerParams {
  url: string;
  package: string;
  protoPath: string;
}

export type GrpcModuleOptions = {
  twitter: GrpcServerParams;
}

export  type GrpcModuleAsyncOptions = {
  imports?: Array<any>;
  inject?: Array<InjectionToken>;
  useFactory: (...args: any[]) => GrpcModuleOptions;
}
