import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PrivacyPolicyType {
  @Field(() => String)
  id: string;

  @Field(() => String)
  userId: string;

  @Field(() => Boolean)
  showProfile: boolean;

  @Field(() => Boolean)
  showAchievements: boolean;

  @Field(() => Boolean)
  showSetups: boolean;

  @Field(() => Boolean)
  showStats: boolean;

  @Field(() => Boolean)
  showBettingHistory: boolean;

  @Field(() => Boolean)
  allowTagInChat: boolean;

  @Field(() => Boolean)
  allowInviteIn1vs1Game: boolean;
}
