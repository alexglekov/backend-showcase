import { Environment } from '@xyro/core'

export interface AppConfig {
  app: {
    platformFee: number;
    timeframeSeconds: number;
    startDelay: number;
    asset: string;
    nextTryStartGame: number;
    env: Environment;
    dbTransactionTimeout: number;
  };
}
