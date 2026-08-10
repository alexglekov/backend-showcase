export interface RedisConfig {
  redis: {
    host: string;
    port: number;
    keyPrefix: string;
  };
}
