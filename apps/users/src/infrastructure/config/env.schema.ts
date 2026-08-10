import { Environment, Stages } from '@xyro/core';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class EnvSchema {
  @IsString()
  @IsNotEmpty()
  @IsEnum(Environment)
  NODE_ENV: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(Stages)
  STAGE: string;

  @IsNumber()
  @IsNotEmpty()
  PORT: number;

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
  JWT_SECRET: string;

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
  S3_STORAGE_TYPE: string;

  @IsString()
  @IsNotEmpty()
  AWS_ACCESS_KEY: string;

  @IsString()
  @IsNotEmpty()
  AWS_SECRET_ACCESS_KEY: string;

  @IsString()
  @IsNotEmpty()
  AWS_S3_BUCKET: string;

  @IsString()
  @IsNotEmpty()
  AWS_S3_ENDPOINT: string;

  @IsString()
  @IsNotEmpty()
  AWS_REGION: string;

  @IsString()
  @IsNotEmpty()
  AWS_S3_EXPIRES_IN: string;

  @IsString()
  @IsNotEmpty()
  COINS_PAID_KEY: string;

  @IsString()
  @IsNotEmpty()
  COINS_PAID_SECRET_KEY: string;

  @IsString()
  @IsNotEmpty()
  COINS_PAID_BASE_URL: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  GRPC_USERS_SERVICE_URL: string;

  @IsString()
  @IsNotEmpty()
  WEB3_CONTRACT_ADDRESS: string;

  @IsString()
  @IsNotEmpty()
  WEB3_SECRET_KEY: string;

  @IsString()
  @IsNotEmpty()
  WEB3_NETWORK: string;
}
