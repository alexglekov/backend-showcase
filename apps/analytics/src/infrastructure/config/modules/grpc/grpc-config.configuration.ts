import { protobufPackage as UsersServiceProtobufPackage } from '@xyro/contracts/users';
import { protobufPackage as MessengerServiceProtobufPackage } from '@xyro/contracts/messenger';
import { protobufPackage as LedgerServiceProtobufPackage } from '@xyro/contracts/ledger';
import { protobufPackage as AnalyticsServiceProtobufPackage } from '@xyro/contracts/analytics';
import { protobufPackage as TwitterServiceProtobufPackage } from '@xyro/contracts/twitter';
import { resolve } from 'node:path';

import { GrpcConfig } from './grpc-config.type';

export const loadGrpcConfig = (): GrpcConfig => {
  return {
    grpc: {
      server: {
        package: AnalyticsServiceProtobufPackage,
        url: process.env.GRPC_ANALYTICS_SERVICE_URL!,
        protoPath: resolve(__dirname, 'grpc', 'analytics', 'analytics.proto'),
      },
      users: {
        package: UsersServiceProtobufPackage,
        url: process.env.GRPC_USERS_SERVICE_URL!,
        protoPath: resolve(__dirname, 'grpc', 'users', 'users.proto'),
      },
      messenger: {
        package: MessengerServiceProtobufPackage,
        url: process.env.GRPC_MESSENGER_SERVICE_URL!,
        protoPath: resolve(__dirname, 'grpc', 'messenger', 'messenger.proto'),
      },
      ledger: {
        package: LedgerServiceProtobufPackage,
        url: process.env.GRPC_LEDGER_SERVICE_URL!,
        protoPath: resolve(__dirname, 'grpc', 'ledger', 'ledger.proto'),
      },
      twitter: {
        package: TwitterServiceProtobufPackage,
        url: process.env.GRPC_TWITTER_SERVICE_URL!,
        protoPath: resolve(__dirname, 'grpc', 'twitter', 'twitter.proto'),
      }
    },
  };
};
