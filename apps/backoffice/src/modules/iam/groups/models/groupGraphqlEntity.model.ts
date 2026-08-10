import { Field, ObjectType } from '@nestjs/graphql';
import { BackofficeGroup } from '@prisma/client';

import { BackofficeUserGraphQLEntity } from '../../users/models/userGraphqlEntity.model';

@ObjectType('BackofficeGroup')
export class BackofficeGroupGraphQLEntity {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  // @Field(() => String, { nullable: true })
  blameId: string | null;

  @Field(() => BackofficeUserGraphQLEntity, { nullable: true })
  blame: BackofficeUserGraphQLEntity;

  constructor(entity: BackofficeGroup) {
    this.id = entity.id;
    this.name = entity.name;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
    this.blameId = entity.blameId;
  }
}