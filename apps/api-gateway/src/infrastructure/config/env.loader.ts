import { loadAppConfig } from './modules/app';
import { loadGraphQLConfig } from './modules/graphql';
import { loadGrpcConfig } from './modules/grpc';
import { loadKafkaConfig } from './modules/kafka';
import { loadRedisConfig } from './modules/redis';
import { loadSchemaRegistryConfig } from './modules/schema-registry';

export const configLoader = [loadAppConfig, loadGraphQLConfig, loadKafkaConfig, loadGrpcConfig, loadRedisConfig, loadSchemaRegistryConfig];
