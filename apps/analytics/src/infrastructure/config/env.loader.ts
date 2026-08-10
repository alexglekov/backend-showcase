import { loadAirdropsConfig } from './modules/airdrops';
import { loadAppConfig } from './modules/app';
import { loadDiscordConfig } from './modules/discord';
import { loadGrpcConfig } from './modules/grpc';
import { loadKafkaConfig } from './modules/kafka';
import { loadNftConfig } from './modules/nft';
import { loadRedisConfig } from './modules/redis';

export const configLoader = [
  loadAppConfig,
  loadRedisConfig,
  loadKafkaConfig,
  loadGrpcConfig,
  loadDiscordConfig,
  loadNftConfig,
  loadAirdropsConfig,
];
