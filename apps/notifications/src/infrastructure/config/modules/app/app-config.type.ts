import { Environment } from '@xyro/core';

export interface AppConfig {
  app: {
    clientUrl: string;
    env: Environment;
    port: number;
  };
}
