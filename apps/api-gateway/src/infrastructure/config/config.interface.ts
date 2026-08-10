import { AppConfig } from './modules/app';
import { GraphQLConfig } from './modules/graphql';
import { GrpcConfig } from './modules/grpc';
import { KafkaConfig } from './modules/kafka';
import { RedisConfig } from './modules/redis';
import { SchemaRegistryConfig } from './modules/schema-registry';

export interface Config extends AppConfig, GraphQLConfig, KafkaConfig, GrpcConfig, RedisConfig, SchemaRegistryConfig {}
