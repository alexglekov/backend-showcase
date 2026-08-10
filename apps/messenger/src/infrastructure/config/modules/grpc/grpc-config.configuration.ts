import { protobufPackage as MessengerServiceProtobufPackage } from '@xyro/contracts/messenger';
import { protobufPackage as LedgerServiceProtobufPackage } from '@xyro/contracts/ledger';
import { resolve } from 'node:path';

import { GrpcConfig } from './grpc-config.type';

export const loadGrpcConfig = (): GrpcConfig => {
  return {
    grpc: {
      server: {
        package: MessengerServiceProtobufPackage,
        url: process.env.GRPC_MESSENGER_SERVICE_URL!,
        protoPath: resolve(__dirname, 'grpc', 'messenger', 'messenger.proto'),
      },
      ledger: {
        package: LedgerServiceProtobufPackage,
        url: process.env.GRPC_LEDGER_SERVICE_URL!,
        protoPath: resolve(__dirname, 'grpc', 'ledger', 'ledger.proto'),
      }
    },
  };
};
