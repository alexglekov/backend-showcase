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
  GRPC_LEDGER_SERVICE_URL: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  KAFKA_BROKER_1: string;

  @IsString()
  KAFKA_BROKER_2: string;

  @IsString()
  KAFKA_BROKER_3: string;
}
