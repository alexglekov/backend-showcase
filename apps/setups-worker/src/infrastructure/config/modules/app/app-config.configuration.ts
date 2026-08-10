import { Environment } from '@xyro/core';

import { AppConfig } from './app-config.type';

export const loadAppConfig = (): AppConfig => {
  return {
    app: {
      env: process.env.NODE_ENV as Environment,
      platformFee: 0.01,
      dbTransactionTimeout: 10000,
    },
  };
};
