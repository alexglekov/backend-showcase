import { Field, ObjectType } from '@nestjs/graphql';
import { BackofficePermission } from '@prisma/client';

@ObjectType('BackofficePermission')
export class BackofficePermissionGraphQLEntity {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  systemName: string;

  constructor(entity: BackofficePermission) {
    this.id = entity.id;
    this.name = entity.name;
    this.systemName = entity.systemName;
  }
}
