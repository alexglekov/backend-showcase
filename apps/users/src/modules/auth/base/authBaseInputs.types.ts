import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class SignInInput {
  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  password: string;
}

@InputType()
export class SignUpInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @Field(() => String)
  email: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  password: string;

  @IsString()
  // @IsOptional()
  // @Field(() => String, { nullable: true })
  // referralCode?: string;
  @IsNotEmpty()
  @Field(() => String)
  referralCode: string;
}
