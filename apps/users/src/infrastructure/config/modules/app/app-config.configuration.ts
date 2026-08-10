import { Environment, Stages } from '@xyro/core';

import { AppConfig } from './app-config.type';

export const loadAppConfig = (): AppConfig => {
  return {
    app: {
      port: parseInt(process.env.PORT!, 10),
      env: process.env.NODE_ENV as Environment,
      platformFee: 0.01,
      stage: process.env.STAGE as Stages,
      dbTransactionTimeout: 10000,
    },
  };
};
