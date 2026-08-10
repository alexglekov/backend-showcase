import { config } from 'dotenv';

declare global {
  namespace Express {}
}

declare module '@nestjs/config' {
  class ConfigService<Config extends Record<unknown, Record<string, unknown>>> {
    public get<ConfigKey extends keyof Config>(parameter: ConfigKey): Config[ConfigKey];
  }
}
