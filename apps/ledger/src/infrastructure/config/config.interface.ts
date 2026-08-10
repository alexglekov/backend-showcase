import { AppConfig } from './modules/app';
import { GrpcConfig } from './modules/grpc';
import { KafkaConfig } from './modules/kafka';

export interface Config extends AppConfig, KafkaConfig, GrpcConfig {}
