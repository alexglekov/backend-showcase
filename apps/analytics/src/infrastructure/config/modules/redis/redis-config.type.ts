export interface RedisConfig {
  redis: {
    // url: string;
    host: string;
    port: number;
    keyPrefix: string,
  };
}
