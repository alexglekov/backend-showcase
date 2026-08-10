import { AppConfig } from './modules/app';
import { CassandraConfig } from './modules/cassandra';
import { GrpcConfig } from './modules/grpc';
import { KafkaConfig } from './modules/kafka';
import { RedisConfig } from './modules/redis';

export interface Config extends AppConfig, RedisConfig, KafkaConfig, CassandraConfig, GrpcConfig {}
