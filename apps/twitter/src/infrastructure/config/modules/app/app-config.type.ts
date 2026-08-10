import { Environment } from '@xyro/core'

export interface AppConfig {
  app: {
    port: number;
    env: Environment;
    dbTransactionTimeout: number;
  };
}
