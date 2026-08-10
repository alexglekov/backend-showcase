import { protobufPackage as UsersServiceProtobufPackage } from '@xyro/contracts/users';
import { resolve } from 'node:path';

import { GrpcConfig } from './grpc-config.type';

export const loadGrpcConfig = (): GrpcConfig => {
  return {
    grpc: {
      users: {
        package: UsersServiceProtobufPackage,
        url: process.env.GRPC_USERS_SERVICE_URL!,
        protoPath: resolve(__dirname, 'grpc', 'users', 'users.proto'),
      }
    },
  };
};
