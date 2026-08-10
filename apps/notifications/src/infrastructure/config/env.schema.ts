import { Environment } from '@xyro/core';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class EnvSchema {
  @IsNumber()
  @IsNotEmpty()
  PORT: number;

  @IsString()
  @IsNotEmpty()
  CLIENT_APP_URL: string;

  @IsString()
  @IsEnum(Environment)
  @IsNotEmpty()
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
  MAILER_SOURCE_EMAIL: string;

  @IsString()
  @IsNotEmpty()
  AWS_SES_MAILER_REGION: string;

  @IsString()
  @IsNotEmpty()
  AWS_SES_MAILER_ACCESS_KEY: string;

  @IsString()
  @IsNotEmpty()
  AWS_SES_MAILER_SECRET_ACCESS_KEY: string;
}
