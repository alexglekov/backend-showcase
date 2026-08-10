import { Environment } from '@xyro/core'

export interface AppConfig {
  app: {
    env: Environment;
    port: number;
    platformFee: number;
    dbTransactionTimeout: number;
  };
}
