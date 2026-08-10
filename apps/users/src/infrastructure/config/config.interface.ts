import { AppConfig } from './modules/app';
import { AuthProvidersConfig } from './modules/auth-providers';
import { GrpcConfig } from './modules/grpc';
import { JwtConfig } from './modules/jwt';
import { KafkaConfig } from './modules/kafka';
import { RedisConfig } from './modules/redis';
import { StorageConfig } from './modules/storage';
import { WalletConfig } from './modules/wallet';
import { Web3Config } from './modules/web3';

export interface Config extends
  AppConfig,
  RedisConfig,
  KafkaConfig,
  JwtConfig,
  AuthProvidersConfig,
  WalletConfig,
  StorageConfig,
  GrpcConfig,
  Web3Config
{}
