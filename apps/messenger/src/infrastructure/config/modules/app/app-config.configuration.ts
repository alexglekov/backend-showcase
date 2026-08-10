import { Environment } from '@xyro/core';

import { AppConfig } from './app-config.type';

export const loadAppConfig = (): AppConfig => {
  return {
    app: {
      port: Number(process.env.PORT),
      env: process.env.NODE_ENV as Environment,
      dbTransactionTimeout: 10000,
      allowedDomains: JSON.parse(process.env.ALLOWED_DOMAINS!) as string[],
    },
  };
};
