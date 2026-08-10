import { Environment } from '@xyro/core';

export interface GrpcConfig {
  grpc: {
    prices: {
      package: string;
      url: string;
      protoPath: string;
    }
  };
}
