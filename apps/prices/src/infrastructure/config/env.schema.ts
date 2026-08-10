import { Environment } from '@xyro/core';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class EnvSchema {
  @IsNumber()
  @IsNotEmpty()
  PORT: number;

  @IsString()
  @IsEnum(Environment)
  @IsNotEmpty()
  NODE_ENV: string;

  @IsString()
  @IsNotEmpty()
  REDIS_HOST: string;

  @IsNumber()
  @IsNotEmpty()
  REDIS_PORT: number;

  @IsString()
  @IsNotEmpty()
  KAFKA_BROKER_1: string;

  @IsString()
  KAFKA_BROKER_2: string;

  @IsString()
  KAFKA_BROKER_3: string;

  @IsString()
  @IsNotEmpty()
  GRPC_PRICES_SERVICE_URL: string;

  @IsString()
  @IsNotEmpty()
  AWS_KEYSPACES_NAME: string;

  @IsString()
  @IsNotEmpty()
  AWS_KEYSPACES_ACCESS_KEY: string;

  @IsString()
  @IsNotEmpty()
  AWS_KEYSPACES_SECRET_ACCESS_KEY: string;

  @IsString()
  @IsNotEmpty()
  AWS_KEYSPACES_REGION: string;

  @IsString()
  @IsNotEmpty()
  AWS_KEYSPACES_ENDPOINT: string;
  @IsNumber()
  @IsNotEmpty()
  AWS_KEYSPACES_PORT: number;

  @IsString()
  @IsNotEmpty()
  KEYSPACE_STORAGE_TYPE: string;

  @IsString()
  @IsNotEmpty()
  BYBIT_KEY: string;

  @IsString()
  @IsNotEmpty()
  BYBIT_SECRET: string;
}
