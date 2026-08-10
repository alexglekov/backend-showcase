import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { PrivacyService } from './privacy.service';
import { ChangePrivacyPolicyInput } from './types/privacy.input.types';
import { PrivacyPolicyType } from './types/privacy.output.types';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';

@Resolver()
export class PrivacyResolver {
  constructor(private readonly privacyService: PrivacyService) {}

  @Query(() => PrivacyPolicyType)
  async getPrivacyPolicies(@UserCredentials() credentials: IUserCredentials) {
    const { userId } = credentials;
    const result = await this.privacyService.getPolicyPolicies(userId);

    return result;
  }

  @Mutation(() => PrivacyPolicyType)
  async updatePrivacyPolicy(
    @UserCredentials() credentials: IUserCredentials,
    @Args('changes') changes: ChangePrivacyPolicyInput,
  ) {
    const { userId } = credentials;

    return this.privacyService.updatePolicy(userId, changes);
  }
}
