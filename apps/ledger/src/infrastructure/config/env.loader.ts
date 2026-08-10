import { loadAppConfig } from './modules/app';
import { loadGrpcConfig } from './modules/grpc';
import { loadKafkaConfig } from './modules/kafka';

export const configLoader = [
  loadAppConfig,
  loadKafkaConfig,
  loadGrpcConfig,
];
