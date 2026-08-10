import { Environment } from '@xyro/core';
import { v4 as uuid } from 'uuid';

import { AppConfig } from './app-config.type';

export const loadAppConfig = (): AppConfig => {
  return {
    app: {
      replicaId: uuid(),
      domains: JSON.parse(process.env.DOMAINS!),
      origins: JSON.parse(process.env.ORIGINS!),
      url: process.env.APP_URL!,
      port: parseInt(process.env.PORT!, 10),
      env: process.env.NODE_ENV as Environment,
    },
  };
};
