import { Environment } from '@xyro/core';

import { AppConfig } from './app-config.type';

export const loadAppConfig = (): AppConfig => {
  return {
    app: {
      port: parseInt(process.env.PORT!, 10),
      env: process.env.NODE_ENV as Environment,
      clientUrl: process.env.CLIENT_APP_URL!,
    },
  };
};
