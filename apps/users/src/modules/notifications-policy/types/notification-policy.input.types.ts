import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ChangeEmailNotificationPolicyInput {
  @Field(() => Boolean, { nullable: true })
  sendNotificationsToEmail?: boolean;

  @Field(() => Boolean, { nullable: true })
  notifyBetsResult?: boolean;

  @Field(() => Boolean, { nullable: true })
  notifyBettingInvitation?: boolean;

  @Field(() => Boolean, { nullable: true })
  notifyNewAchievements?: boolean;

  @Field(() => Boolean, { nullable: true })
  notifyUpdates?: boolean;
}
