import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class GetMetamaskChallengeInput {
  @Field(() => String)
  walletAddress: string;
}

@ObjectType('MetamaskChallenge')
export class MetamaskChallengeGraphQLEntity {
  @Field(() => String)
  challenge: string;

  @Field(() => Boolean)
  walletHasAnyNft: boolean;

  constructor(payload: MetamaskChallengeGraphQLEntity) {
    this.challenge = payload.challenge;
    this.walletHasAnyNft = payload.walletHasAnyNft;
  }
}

@InputType()
export class VerifyMetamaskSignatureInput {
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
  walletAddress: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  signature: string;
}

@InputType()
export class AttachWalletInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  walletAddress: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  signature: string;
}
