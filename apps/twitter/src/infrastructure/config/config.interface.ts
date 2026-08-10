import { AppConfig } from './modules/app';
import { GrpcConfig } from './modules/grpc';
import { KafkaConfig } from './modules/kafka';
import { RedisConfig } from './modules/redis';
import { TwitterConfig } from './modules/twitter';

export interface Config extends AppConfig, RedisConfig, KafkaConfig, GrpcConfig, TwitterConfig {}
