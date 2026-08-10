import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '@prisma/client';

@ObjectType('User')
export class UserGraphQLEntity {
  @Field()
  id: string;

  @Field(() => String, { nullable: true })
  email?: string | null;

  @Field()
  name: string;

  @Field(() => [String])
  avatarKeys: string[];

  @Field(() => [String], { defaultValue: [] })
  avatarUris: string[];

  constructor(entity: User) {
    this.email = entity.email;
    this.id = entity.id;
    this.name = entity.name;
    this.avatarKeys = entity.avatarKeys as string[];
  }
}
