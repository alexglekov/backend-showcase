import { Environment } from '@xyro/core';

export interface AppConfig {
  app: {
    platformFee: number;
    dbTransactionTimeout: number;
  };
}
