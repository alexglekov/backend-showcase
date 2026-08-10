import { AppConfig } from './modules/app';
import { GrpcConfig } from './modules/grpc';
import { JwtConfig } from './modules/jwt';
import { KafkaConfig } from './modules/kafka';
import { RedisConfig } from './modules/redis';

export interface Config extends AppConfig, KafkaConfig, GrpcConfig, JwtConfig, RedisConfig {}
