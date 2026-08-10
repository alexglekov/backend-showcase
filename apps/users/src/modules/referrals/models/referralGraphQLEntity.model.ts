import { Directive, Field, ObjectType } from '@nestjs/graphql';
import { Referral, User } from '@prisma/client';
import { GraphQLEntitiesNames } from '@xyro/core';

import { UserGraphQLEntity } from '../../users';

@ObjectType(GraphQLEntitiesNames.Referral)
export class ReferralGraphQLEntity {
  @Field()
  code: string;

  userId?: string;

  referrerId?: string;

  @Field(() => UserGraphQLEntity, { nullable: true })
  user?: UserGraphQLEntity;

  @Field()
  active: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  fetchedUserFromDb?: User;
  fetchedReferrerFromDb?: User;

  constructor(entity: Referral & { user?: User; referrer?: User }) {
    this.code = entity.code;
    this.active = entity.active;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
    this.userId = entity.userId || undefined;
    this.referrerId = entity.referrerId || undefined;

    this.fetchedUserFromDb = entity.user;
    this.fetchedReferrerFromDb = entity.referrer;
  }
}