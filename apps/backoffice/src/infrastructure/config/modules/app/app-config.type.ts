import { Environment } from '@xyro/core';

interface TestAccount {
  surname: string;
  name: string;
  password: string;
  email: string;
}

export interface AppConfig {
  app: {
    domains: Array<string>;
    env: Environment;
    origins: Array<string>;
    port: number;
    replicaId: string;
    testAccounts: {
      admins: TestAccount[];
      developers: TestAccount[];
    }
  };
}
