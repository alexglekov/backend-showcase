import { Environment } from '@xyro/core';

export interface GrpcConfig {
  grpc: {
    analytics: {
      package: string;
      url: string;
      protoPath: string;
    };
    users: {
      package: string;
      url: string;
      protoPath: string;
    };
  };
}
