import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

@InputType('PaginatedInput')
export class PaginatedGraphQLInput {
  @Field(() => Int, { defaultValue: 0, nullable: true })
  @IsInt()
  @Min(0)
  @IsOptional()
  skip!: number;

  @Field(() => Int, { defaultValue: 5, nullable: true })
  @IsInt()
  @Max(50)
  @Min(1)
  @IsOptional()
  take!: number;
}

@ObjectType('PaginatedOutput')
export class PaginatedGraphQLOutput {
  @Field(() => Int, {
    deprecationReason: 'This field will not be filled in with data and will soon be removed from the schema',
    defaultValue: 0,
  })
  total!: number;

  @Field(() => Int)
  skip!: number;

  @Field(() => Int)
  take!: number;
}