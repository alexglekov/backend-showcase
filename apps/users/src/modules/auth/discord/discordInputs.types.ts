import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class GetDiscordAuthUriInput {
  @Field(() => String)
  redirectUri: string;
}

@InputType()
export class AttachDiscordInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  state: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  code: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  redirectUri: string;
}

@InputType()
export class VerifyOAuth2DiscordInput {
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  username?: string;
  
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  referralCode?: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  state: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  code: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  redirectUri: string;
}
