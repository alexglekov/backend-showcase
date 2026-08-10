import { Field, InputType } from '@nestjs/graphql';
import { PaginatedGraphQLInput } from '@xyro/libs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name: string;

  @Field({ nullable: true })
  @IsEmail()
  @IsString()
  @IsOptional()
  email: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  bio: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  password: string;
}

@InputType()
export class DeleteAccountInput {
  @Field()
  reason: string;
}

@InputType('FindUserInput')
export class FindUserGraphQLInput {
  @Field({ nullable: true })
  @IsString()
  @IsUUID(4)
  @IsOptional()
  id: string;
}

@InputType()
export class FindUsersInput extends PaginatedGraphQLInput {
  @Field({ nullable: true })
  name: string;
}

@InputType()
export class CheckNameAvailabilityInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;
}
