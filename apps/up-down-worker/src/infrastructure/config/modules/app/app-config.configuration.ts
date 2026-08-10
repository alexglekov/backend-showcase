import { Environment } from '@xyro/core';

import { AppConfig } from './app-config.type';

export const loadAppConfig = (): AppConfig => {
  return {
    app: {
      platformFee: 0.01,
      timeframeSeconds: 30,
      startDelay: 3000,
      asset: 'BTC',
      nextTryStartGame: 5000,
      env: process.env.NODE_ENV as Environment,
      dbTransactionTimeout: 10000,
    },
  };
};
