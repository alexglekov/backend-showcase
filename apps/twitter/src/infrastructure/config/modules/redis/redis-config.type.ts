export interface RedisConfig {
  redis: {
    keyPrefix: string;
    host: string;
    port: number;
  };
}
