import { Environment } from '@xyro/core';
import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class EnvSchema {
  @IsNumber()
  @IsNotEmpty()
  PORT: number;

  @IsString()
  @IsNotEmpty()
  APP_URL: string;

  @IsString()
  @IsNotEmpty()
  BRANCH_NAME: string;

  @IsString()
  @IsEnum(Environment)
  @IsNotEmpty()
  NODE_ENV: string;

  @IsDefined()
  DOMAINS: object;

  @IsDefined()
  ORIGINS: object;

  @IsDefined()
  SERVER_LISTS: object;

  @IsString()
  @IsNotEmpty()
  REDIS_PORT: string;

  @IsString()
  @IsNotEmpty()
  REDIS_HOST: string;

  @IsString()
  @IsNotEmpty()
  KAFKA_BROKER_1: string;

  @IsString()
  KAFKA_BROKER_2: string;

  @IsString()
  KAFKA_BROKER_3: string;

  @IsString()
  @IsNotEmpty()
  APOLLO_STUDIO_GRAPH_ID: string;

  @IsString()
  @IsNotEmpty()
  APOLLO_STUDIO_API_KEY: string;

  @IsString()
  @IsNotEmpty()
  GRPC_USERS_SERVICE_URL: string;

  @IsString()
  @IsNotEmpty()
  GRPC_LEDGER_SERVICE_URL: string;
}
