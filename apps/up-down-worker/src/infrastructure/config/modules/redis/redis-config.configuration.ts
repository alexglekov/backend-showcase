import { RedisConfig } from './redis-config.type';

export const loadRedisConfig = (): RedisConfig => {
  return {
    redis: {
      host: process.env.REDIS_HOST!,
      port: Number(process.env.REDIS_PORT),
    },
  };
};
