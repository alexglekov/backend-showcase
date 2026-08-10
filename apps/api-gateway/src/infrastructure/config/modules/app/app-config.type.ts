import { Environment } from '@xyro/core';

export interface AppConfig {
  app: {
    domains: Array<string>;
    url: string;
    env: Environment;
    origins: Array<string>;
    port: number;
    replicaId: string;
  };
}
