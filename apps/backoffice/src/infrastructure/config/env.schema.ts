import { Environment } from '@xyro/core';
import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class EnvSchema {
  @IsNumber()
  @IsNotEmpty()
  PORT: number;

  @IsString()
  @IsEnum(Environment)
  @IsNotEmpty()
  NODE_ENV: string;

  @IsDefined()
  DOMAINS: object;

  @IsDefined()
  ORIGINS: object;

  @IsString()
  @IsNotEmpty()
  KAFKA_BROKER_1: string;

  @IsString()
  KAFKA_BROKER_2: string;

  @IsString()
  KAFKA_BROKER_3: string;

  @IsString()
  @IsNotEmpty()
  GRPC_USERS_SERVICE_URL: string;

  @IsString()
  @IsNotEmpty()
  GRPC_ANALYTICS_SERVICE_URL: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  REDIS_PORT: string;

  @IsString()
  @IsNotEmpty()
  REDIS_HOST: string;

  // ------------------- TEST ACCOUNTS -------------------
  @IsString()
  @IsNotEmpty()
  TEST_ADMIN_NAME: string;

  @IsString()
  @IsNotEmpty()
  TEST_ADMIN_SURNAME: string;

  @IsString()
  @IsNotEmpty()
  TEST_ADMIN_EMAIL: string;

  @IsString()
  @IsNotEmpty()
  TEST_ADMIN_PASSWORD: string;
}
