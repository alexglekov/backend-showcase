import { ObjectType, Field, Directive, HideField } from '@nestjs/graphql';
import { GraphQLEntitiesNames, PrivacyPolicies } from '@xyro/core';
import { UserEntity } from '@xyro/contracts/users';
import { TwitterAccountGraphQLOrphanEntity } from '@xyro/contracts/twitter';

@ObjectType('UserDiscordAccount')
export class UserDiscordGraphQLEntity {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => [String])
  roles: string[];
}

@ObjectType('UserWalletAccount')
export class UserWalletGraphQLEntity {
  @Field(() => String)
  address: string;
}

@ObjectType(GraphQLEntitiesNames.User)
@Directive('@key(fields: "id request")')
export class UserGraphQLEntity extends UserEntity {
  @Field(() => [String])
  avatarUris?: string[];

  @HideField()
  @Field(() => [String], { nullable: true, deprecationReason: 'Not used' })
  request: PrivacyPolicies[];

  @Field(() => UserDiscordGraphQLEntity, { nullable: true })
  discord: UserDiscordGraphQLEntity;

  @Field(() => TwitterAccountGraphQLOrphanEntity, { nullable: true })
  twitter: TwitterAccountGraphQLOrphanEntity;

  @Field(() => UserWalletGraphQLEntity, { nullable: true })
  wallet: UserWalletGraphQLEntity;
}
