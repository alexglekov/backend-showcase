import { protobufPackage as LedgerServiceProtobufPackage } from '@xyro/contracts/ledger';
import { resolve } from 'node:path';

import { GrpcConfig } from './grpc-config.type';

export const loadGrpcConfig = (): GrpcConfig => {
  return {
    grpc: {
      server: {
        package: LedgerServiceProtobufPackage,
        url: process.env.GRPC_LEDGER_SERVICE_URL!,
        protoPath: resolve(__dirname, 'grpc', 'ledger', 'ledger.proto'),
      }
    },
  };
};
