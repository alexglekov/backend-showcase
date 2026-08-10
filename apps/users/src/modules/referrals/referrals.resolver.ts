import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';

import { ReferralsService } from './referrals.service';
import { ReferralGraphQLEntity } from './models/referralGraphQLEntity.model';
import {
  CheckReferralAvalabilityGraphQLInput,
  ReferralStatisticGraphQLEntity,
  UpdateReferralGraphQLInput
} from './models/referralGraphqlModels';
import { UserGraphQLEntity, UsersService } from '../users';

@Resolver(() => ReferralGraphQLEntity)
export class ReferralsResolver {
  constructor(
    private readonly referralsService: ReferralsService,
    private readonly usersService: UsersService,
  ) {}

  @Query(() => ReferralGraphQLEntity)
  async getReferral(
    @UserCredentials() credentials: IUserCredentials,
  ) : Promise<ReferralGraphQLEntity> {
    const { userId } = credentials;

    const referral = await this.referralsService.getUserReferral({ userId });

    return new ReferralGraphQLEntity(referral);
  }

  @Mutation(() => ReferralGraphQLEntity)
  async updateReferral(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') data: UpdateReferralGraphQLInput,
  ) : Promise<ReferralGraphQLEntity> {
    const { userId } = credentials;

    const referral = await this.referralsService.updateUserReferral({
      userId,
      code: data.code
    });

    return new ReferralGraphQLEntity(referral);
  }

  @Query(() => ReferralStatisticGraphQLEntity)
  async getReferralStatistic(
    @UserCredentials() credentials: IUserCredentials,
  ) : Promise<ReferralStatisticGraphQLEntity> {
    const { userId } = credentials;

    const payload = await this.referralsService.getUserReferralsStatistic({
      userId,
    });

    return new ReferralStatisticGraphQLEntity(payload);
  }

  @Query(() => ReferralGraphQLEntity)
  async checkReferralAvalability(
    @Args('data') input: CheckReferralAvalabilityGraphQLInput,
  ) {
    const referral = await this.referralsService.checkReferralAvalability(input);

    return new ReferralGraphQLEntity(referral);

  }

  @ResolveField(() => UserGraphQLEntity, { nullable: true, name: 'user' })
  async resolveUserField(@Parent() parent: ReferralGraphQLEntity) {
    if (!parent.userId) return null;

    if (parent.fetchedUserFromDb) {
      return new UserGraphQLEntity(parent.fetchedUserFromDb);
    }

    const fetchedUser = await this.usersService.findById(parent.userId);

    return fetchedUser ? new UserGraphQLEntity(fetchedUser) : null;
  }

  @ResolveField(() => UserGraphQLEntity, { nullable: true, name: 'referrer' })
  async resolveReferrerField(
    @UserCredentials(false) credentials: IUserCredentials,
    @Parent() parent: ReferralGraphQLEntity,
  ) {
    if (!credentials) return null;

    const { userId } = credentials;

    if (userId !== parent.userId) return null; // don't allow see user referrer

    if (!parent.referrerId) return null;

    if (parent.fetchedReferrerFromDb) {
      return new UserGraphQLEntity(parent.fetchedReferrerFromDb);
    }

    const fetchedUser = await this.usersService.findById(parent.referrerId);

    return fetchedUser ? new UserGraphQLEntity(fetchedUser) : null;
  }
}
