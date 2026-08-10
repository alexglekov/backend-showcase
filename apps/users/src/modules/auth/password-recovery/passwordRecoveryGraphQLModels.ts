import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class RequestRecoveryPasswordInput {
  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

@InputType()
export class RecoveryPasswordInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  token: string;
}