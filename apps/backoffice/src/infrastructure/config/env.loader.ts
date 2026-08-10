import { loadAppConfig } from './modules/app';
import { loadGrpcConfig } from './modules/grpc';
import { loadJwtConfig } from './modules/jwt';
import { loadKafkaConfig } from './modules/kafka';
import { loadRedisConfig } from './modules/redis';

export const configLoader = [loadAppConfig, loadKafkaConfig, loadGrpcConfig, loadJwtConfig, loadRedisConfig];
