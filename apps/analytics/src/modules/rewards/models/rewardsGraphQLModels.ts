import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@InputType('ClaimRewardInput')
export class ClaimRewardGraphQLInput {
  @IsString()
  @IsUUID(4)
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  id: string;
}

@InputType('CheckChallengeTaskCompletionInput')
export class CheckChallengeTaskCompletionGraphQLInput {
  @IsString()
  @IsUUID(4)
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  id: string;
}
