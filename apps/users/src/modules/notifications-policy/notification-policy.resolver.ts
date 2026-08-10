import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';

import { NotificationPolicyService } from './notification-policy.service';
import { ChangeEmailNotificationPolicyInput } from './types/notification-policy.input.types';
import { EmailNotificationPolicyType } from './types/notification-policy.output.types';

@Resolver()
export class NotificationPolicyResolver {
  constructor(
    private readonly notificationPolicyService: NotificationPolicyService,
  ) {}

  @Query(() => EmailNotificationPolicyType)
  async getNotificationsPolicies(@UserCredentials() credentials: IUserCredentials) {
    const { userId } = credentials;

    const result = await this.notificationPolicyService.getNotificationPolicies(
      userId,
    );
    return result;
  }

  @Mutation(() => EmailNotificationPolicyType)
  async updateNotificationsPolicy(
    @UserCredentials() credentials: IUserCredentials,
    @Args('changes') changes: ChangeEmailNotificationPolicyInput,
  ) {
    const { userId } = credentials;

    return this.notificationPolicyService.updateNotificationPolicy(
      userId,
      changes,
    );
  }
}
