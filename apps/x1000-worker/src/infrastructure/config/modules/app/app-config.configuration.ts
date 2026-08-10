import { AppConfig } from './app-config.type';

export const loadAppConfig = (): AppConfig => {
  return {
    app: {
      platformFee: 0.01,
      dbTransactionTimeout: 10000,
    },
  };
};
