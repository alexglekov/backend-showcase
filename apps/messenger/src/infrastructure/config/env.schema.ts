import { Environment } from '@xyro/core';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class EnvSchema {
  @IsNumber()
  @IsNotEmpty()
  PORT: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(Environment)
  NODE_ENV: string;

  @IsString()
  @IsNotEmpty()
  KAFKA_BROKER_1: string;

  @IsString()
  KAFKA_BROKER_2: string;

  @IsString()
  KAFKA_BROKER_3: string;

  @IsString()
  @IsNotEmpty()
  ALLOWED_DOMAINS: string;

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
}
