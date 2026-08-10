import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ChangePrivacyPolicyInput {
  @Field(() => Boolean, { nullable: true })
  showProfile?: boolean;

  @Field(() => Boolean, { nullable: true })
  showAchievements?: boolean;

  @Field(() => Boolean, { nullable: true })
  showSetups?: boolean;

  @Field(() => Boolean, { nullable: true })
  showStats?: boolean;

  @Field(() => Boolean, { nullable: true })
  showBettingHistory?: boolean;

  @Field(() => Boolean, { nullable: true })
  allowTagInChat?: boolean;

  @Field(() => Boolean, { nullable: true })
  allowInviteIn1vs1Game?: boolean;
}
