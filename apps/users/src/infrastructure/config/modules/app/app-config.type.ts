import { Environment, Stages } from '@xyro/core'

export interface AppConfig {
  app: {
    env: Environment;
    stage: Stages;
    port: number;
    platformFee: number;
    dbTransactionTimeout: number;
  };
}
