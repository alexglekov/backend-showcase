import { Environment } from '@xyro/core';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class EnvSchema {
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
  REDIS_PORT: string;

  @IsString()
  @IsNotEmpty()
  REDIS_HOST: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  GRPC_PRICES_SERVICE_URL: string;
}
