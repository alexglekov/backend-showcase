import { Directive, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLEntitiesNames } from '@xyro/core';
import { UserV2 } from 'twitter-api-v2';

@ObjectType(GraphQLEntitiesNames.TwitterAccount)
@Directive('@key(fields: "id")')
export class TwitterAccountGraphQLEntity {
  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  profileImageUrl?: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  constructor(twitterAccount: Pick<UserV2, 'id'> & Partial<UserV2>) {
    this.id = twitterAccount.id;
    this.name = twitterAccount.name;
    this.username = twitterAccount.username;
    this.description = twitterAccount.description;
    this.profileImageUrl = twitterAccount.profile_image_url;
  }
}
