import { protobufPackage as MessengerServiceProtobufPackage } from '@xyro/contracts/twitter';
import { resolve } from 'node:path';

import { GrpcConfig } from './grpc-config.type';

export const loadGrpcConfig = (): GrpcConfig => {
  return {
    grpc: {
      server: {
        package: MessengerServiceProtobufPackage,
        url: process.env.GRPC_TWITTER_SERVICE_URL!,
        protoPath: resolve(__dirname, 'grpc', 'twitter', 'twitter.proto'),
      },
    },
  };
};
