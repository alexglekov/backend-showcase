import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EmailNotificationPolicyType {
  @Field(() => String)
  id: string;

  @Field(() => String)
  userId: string;

  @Field(() => Boolean)
  sendNotificationsToEmail: boolean;

  @Field(() => Boolean)
  notifyBetsResult: boolean;

  @Field(() => Boolean)
  notifyBettingInvitation: boolean;

  @Field(() => Boolean)
  notifyNewAchievements: boolean;

  @Field(() => Boolean)
  notifyUpdates: boolean;
}
