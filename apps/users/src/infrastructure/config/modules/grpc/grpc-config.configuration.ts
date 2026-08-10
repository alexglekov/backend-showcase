import { protobufPackage as UsersServiceProtobufPackage } from '@xyro/contracts/users';
import { protobufPackage as TwitterServiceProtobufPackage } from '@xyro/contracts/twitter';
import { resolve } from 'node:path';

import { GrpcConfig } from './grpc-config.type';

export const loadGrpcConfig = (): GrpcConfig => {
  return {
    grpc: {
      server: {
        package: UsersServiceProtobufPackage,
        url: process.env.GRPC_USERS_SERVICE_URL!,
        protoPath: resolve(__dirname, 'grpc', 'users', 'users.proto'),
      },
      twitter: {
        package: TwitterServiceProtobufPackage,
        url: process.env.GRPC_TWITTER_SERVICE_URL!,
        protoPath: resolve(__dirname, 'grpc', 'twitter', 'twitter.proto'),
      },
    },
  };
};
