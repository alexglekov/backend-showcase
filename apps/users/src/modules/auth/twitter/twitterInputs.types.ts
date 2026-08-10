import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType('SignInWithOAuth2TwitterInput')
export class SignInWithOAuth2TwitterGraphQLInput {
  @IsString()
  @IsNotEmpty({ message: 'State is not provided.' })
  @Field(() => String)
  state: string;

  @IsString()
  @IsNotEmpty({ message: 'Redirect URL is not provided.' })
  @Field(() => String)
  redirectUri: string;

  @IsString({ message: 'Code is not provided.' })
  @IsNotEmpty()
  @Field(() => String)
  code: string;
}

@InputType('SignUpWithOAuth2TwitterInput')
export class SignUpWithOAuth2TwitterGraphQLInput {
  @IsString()
  @IsNotEmpty({ message: 'Username is not provided.' })
  @Field(() => String)
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'Referral code is not provided.' })
  @Field(() => String)
  referralCode: string;

  @IsString()
  @IsNotEmpty({ message: 'State is not provided.' })
  @Field(() => String)
  state: string;

  @IsString()
  @IsNotEmpty({ message: 'Redirect URL is not provided.' })
  @Field(() => String)
  redirectUri: string;

  @IsString({ message: 'Code is not provided.' })
  @IsNotEmpty()
  @Field(() => String)
  code: string;
}

@InputType('AttachTwitterInput')
export class AttachTwitterGraphQLInput {
  @IsString()
  @IsNotEmpty({ message: 'State is not provided.' })
  @Field(() => String)
  state: string;

  @IsString()
  @IsNotEmpty({ message: 'Redirect URL is not provided.' })
  @Field(() => String)
  redirectUri: string;

  @IsString({ message: 'Code is not provided.' })
  @IsNotEmpty()
  @Field(() => String)
  code: string;
}

@InputType('GetTwitterAuthUriInput')
export class GetTwitterAuthUriGraphQLInput {
  @IsString()
  @IsNotEmpty({ message: 'Redirect URL is not provided.' })
  @Field(() => String)
  redirectUri: string;
}
