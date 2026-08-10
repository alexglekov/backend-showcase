import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

@ObjectType('ReferralStatistic')
export class ReferralStatisticGraphQLEntity {
  @Field(() => Int)
  numberOfInvited: number;

  @Field(() => Int)
  numberOfSecondLevelInvited: number;

  constructor(payload: ReferralStatisticGraphQLEntity) {
    this.numberOfInvited = payload.numberOfInvited;
    this.numberOfSecondLevelInvited = payload.numberOfSecondLevelInvited;
  }
}

@InputType('CheckReferralAvalabilityInput')
export class CheckReferralAvalabilityGraphQLInput {
  @Field(() => String)
  @IsNotEmpty({ message: "Referral code must be shorter than or equal to 13 characters." })
  @Matches(
    new RegExp(/^[a-zA-Z0-9_\-\.]+$/),
    { message: "Referral code can containt numbers, characters [a-z] or symbols _, -, ." }
  )
  @Length(3, 15, { message: "Referral code must be shorter than 15 and longer than 3 characters." })
  @IsString()
  code: string;
}

@InputType('UpdateReferralInput')
export class UpdateReferralGraphQLInput {
  @Field(() => String)
  @IsNotEmpty({ message: "Referral code must be shorter than or equal to 13 characters." })
  @Matches(
    new RegExp(/^[a-zA-Z0-9_\-\.]+$/),
    { message: "Referral code can containt numbers, characters [a-z] or symbols _, -, ." }
  )
  @Length(3, 15, { message: "Referral code must be shorter than 15 and longer than 3 characters." })
  @IsString()
  code: string;
}

