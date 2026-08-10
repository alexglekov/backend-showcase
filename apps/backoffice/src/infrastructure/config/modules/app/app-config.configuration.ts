import { Environment } from '@xyro/core';
import { v4 as uuid } from 'uuid';

import { AppConfig } from './app-config.type';

export const loadAppConfig = (): AppConfig => {
  return {
    app: {
      replicaId: uuid(),
      domains: JSON.parse(process.env.DOMAINS!),
      origins: JSON.parse(process.env.ORIGINS!),
      port: parseInt(process.env.PORT!, 10),
      env: process.env.NODE_ENV as Environment,
      testAccounts: {
        admins: [
          {
            name: process.env.TEST_ADMIN_NAME!,
            surname: process.env.TEST_ADMIN_SURNAME!,
            email: process.env.TEST_ADMIN_EMAIL!,
            password: process.env.TEST_ADMIN_PASSWORD!,
          }
        ],
        developers: [],
      }
    },
  };
};
