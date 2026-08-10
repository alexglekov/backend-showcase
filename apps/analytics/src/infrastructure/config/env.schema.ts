import { Environment } from '@xyro/core';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class EnvSchema {
  @IsString()
  @IsNotEmpty()
  @IsEnum(Environment)
  NODE_ENV: string;

  @IsNumber()
  @IsNotEmpty()
  PORT: number;

  @IsString()
  @IsNotEmpty()
  KAFKA_BROKER_1: string;

  @IsString()
  KAFKA_BROKER_2: string;

  @IsString()
  KAFKA_BROKER_3: string;

  @IsString()
  @IsNotEmpty()
  REDIS_PORT: string;

  @IsString()
  @IsNotEmpty()
  REDIS_HOST: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  GRPC_USERS_SERVICE_URL: string;

  @IsString()
  @IsNotEmpty()
  GRPC_LEDGER_SERVICE_URL: string;

  @IsString()
  @IsNotEmpty()
  GRPC_MESSENGER_SERVICE_URL: string;

  @IsString()
  @IsNotEmpty()
  GRPC_ANALYTICS_SERVICE_URL: string;

  @IsString()
  @IsNotEmpty()
  GRPC_TWITTER_SERVICE_URL: string;

  @IsString()
  @IsNotEmpty()
  TWITTER_CLIENT_ID: string;

  @IsString()
  @IsNotEmpty()
  TWITTER_CLIENT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  DISCORD_CLIENT_ID: string;

  @IsString()
  @IsNotEmpty()
  DISCORD_BOT_TOKEN: string;

  @IsString()
  @IsNotEmpty()
  DISCORD_GUILD_ID: string;

  @IsString()
  @IsNotEmpty()
  DISCORD_CLIENT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  NFT_CONTRACT_ADDRESS: string;

  @IsString()
  @IsNotEmpty()
  NETWORK: string;

  @IsString()
  @IsNotEmpty()
  RPC_URL: string;

  @IsString()
  @IsNotEmpty()
  TELEGRAM_REWARDS_BOT_SECRET_KEY: string;
}
