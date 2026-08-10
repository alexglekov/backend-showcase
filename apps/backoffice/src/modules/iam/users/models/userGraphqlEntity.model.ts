import { Field, ObjectType } from '@nestjs/graphql';
import { BackofficeUser } from '@prisma/client';

@ObjectType('BackofficeUser')
export class BackofficeUserGraphQLEntity {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field()
  surname: string;

  constructor(entity: BackofficeUser) {
    this.email = entity.email;
    this.id = entity.id;
    this.name = entity.name;
    this.surname = entity.surname;
  }
}