import { InputType, Field } from '@nestjs/graphql';
import { BetsFilterPaginatedInput } from '@xyro/core';
import { IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';

@InputType()
export class OneVsOneBetsFilterPaginatedInput extends BetsFilterPaginatedInput {}

@InputType()
export class AddOneVsOneBetInput {
  @Field()
  @IsNotEmpty()
  @IsUUID('4')
  gameId: string;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  price?: number;
}
