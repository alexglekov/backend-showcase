import { loadAppConfig } from './modules/app';
import { loadAuthProvidersConfig } from './modules/auth-providers';
import { loadGrpcConfig } from './modules/grpc';
import { loadJwtConfig } from './modules/jwt';
import { loadKafkaConfig } from './modules/kafka';
import { loadRedisConfig } from './modules/redis';
import { loadStorageConfig } from './modules/storage';
import { loadWalletConfig } from './modules/wallet';
import { loadWeb3Config } from './modules/web3';

export const configLoader = [
  loadAppConfig,
  loadRedisConfig,
  loadKafkaConfig,
  loadJwtConfig,
  loadAuthProvidersConfig,
  loadWalletConfig,
  loadStorageConfig,
  loadGrpcConfig,
  loadWeb3Config,
];
