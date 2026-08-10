import { AirdropsConfig } from './modules/airdrops';
import { AppConfig } from './modules/app';
import { DiscordConfig } from './modules/discord';
import { GrpcConfig } from './modules/grpc';
import { KafkaConfig } from './modules/kafka';
import { NftConfig } from './modules/nft';
import { RedisConfig } from './modules/redis';

export interface Config
  extends AppConfig,
    RedisConfig,
    KafkaConfig,
    GrpcConfig,
    DiscordConfig,
    AirdropsConfig,
    NftConfig {}
