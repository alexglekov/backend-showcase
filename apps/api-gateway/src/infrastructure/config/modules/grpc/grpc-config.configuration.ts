import { protobufPackage as UsersServiceProtobufPackage } from '@xyro/contracts/users';
import { protobufPackage as BullsEyeServiceProtobufPackage } from '@xyro/contracts/bulls-eye';
import { protobufPackage as LedgerServiceProtobufPackage } from '@xyro/contracts/ledger';
import { protobufPackage as AnalyticsServiceProtobufPackage } from '@xyro/contracts/analytics';
import { resolve } from 'node:path';

import { GrpcConfig } from './grpc-config.type';

export const loadGrpcConfig = (): GrpcConfig => {
  return {
    grpc: {
      users: {
        package: UsersServiceProtobufPackage,
        url: process.env.GRPC_USERS_SERVICE_URL!,
        protoPath: resolve(__dirname, 'grpc', 'users', 'users.proto'),
      },
      bullsEye: {
        package: BullsEyeServiceProtobufPackage,
        url: process.env.GRPC_BULLS_EYE_SERVICE_URL!,
        protoPath: resolve(__dirname, 'grpc', 'bulls-eye', 'bulls-eye.proto'),
      },
      ledger: {
        package: LedgerServiceProtobufPackage,
        url: process.env.GRPC_LEDGER_SERVICE_URL!,
        protoPath: resolve(__dirname, 'grpc', 'ledger', 'ledger.proto'),
      },
      analytics: {
        package: AnalyticsServiceProtobufPackage,
        url: process.env.GRPC_ANALYTICS_SERVICE_URL!,
        protoPath: resolve(__dirname, 'grpc', 'analytics', 'analytics.proto'),
      }
    },
  };
};
