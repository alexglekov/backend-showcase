import { InjectionToken } from '@nestjs/common';

export type GrpcModuleOptions = {
  analytics: {
    url: string;
    package: string;
    protoPath: string;
  };
  users: {
    url: string;
    package: string;
    protoPath: string;
  };
};

export type GrpcModuleAsyncOptions = {
  imports?: Array<any>;
  inject?: Array<InjectionToken>;
  useFactory: (...args: any[]) => GrpcModuleOptions;
};
