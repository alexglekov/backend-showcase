import { RedisConfig } from './redis-config.type';

export const loadRedisConfig = (): RedisConfig => {
  return {
    redis: {
      keyPrefix: 'backoffice',
      host: process.env.REDIS_HOST!,
      port: Number(process.env.REDIS_PORT),
    },
  };
};
