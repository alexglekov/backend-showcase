import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { PaginatedGraphQLInput, PaginatedGraphQLOutput } from '@xyro/libs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { BackofficeGroupGraphQLEntity } from './groupGraphqlEntity.model';

@InputType()
export class AddGroupInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;
}

@InputType()
export class UpdateGroupInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

@InputType()
export class RemoveGroupInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

@InputType()
export class RemoveUserFromGroupInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @Field()
  @IsUUID()
  @IsNotEmpty()
  groupId: string;
}

@InputType()
export class AddUserToGroupInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @Field()
  @IsUUID()
  @IsNotEmpty()
  groupId: string;
}


@InputType()
export class GetAllGroupsInput extends PaginatedGraphQLInput {}

@ObjectType('Groups')
export class Groups extends PaginatedGraphQLOutput {
  @Field(() => [BackofficeGroupGraphQLEntity])
  groups: BackofficeGroupGraphQLEntity[];

  constructor(entity: Groups) {
    super();

    this.groups = entity.groups;
    this.total = entity.total;
    this.skip = entity.skip;
    this.take = entity.take;
  }
}
