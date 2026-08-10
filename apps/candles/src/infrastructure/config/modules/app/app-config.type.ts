import { Environment } from '@xyro/core';

export interface AppConfig {
  app: {
    env: Environment;
    port: number;
    byBitKey: string;
    byBitSecret: string;
  };
}
