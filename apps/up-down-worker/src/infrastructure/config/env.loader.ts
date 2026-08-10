import { loadAppConfig } from './modules/app';
import { loadGrpcConfig } from './modules/grpc';
import { loadKafkaConfig } from './modules/kafka';
import { loadRedisConfig } from './modules/redis';
import { loadTelegramConfig } from './modules/telegram';

export const configLoader = [
  loadAppConfig,
  loadRedisConfig,
  loadKafkaConfig,
  loadGrpcConfig,
  loadTelegramConfig,
];
