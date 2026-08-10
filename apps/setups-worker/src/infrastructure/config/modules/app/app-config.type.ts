import { Environment } from '@xyro/core';

export interface AppConfig {
  app: {
    env: Environment;
    platformFee: number;
    dbTransactionTimeout: number;
  };
}
