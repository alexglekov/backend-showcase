import { InputType, Field } from '@nestjs/graphql';
import { BetsFilterPaginatedInput } from '@xyro/core';
import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

@InputType()
export class AddBullsEyeBetInput {
  @Field()
  @IsString({
    message: `You entered an incorrect game ID`
  })
  @IsUUID(undefined, {
    message: `You entered an incorrect game ID`
  })
  @IsNotEmpty({
    message: `You entered an incorrect game ID`
  })
  gameId: string;

  @IsNumber(undefined, {
    message: 'You entered an incorrect price',
  })
  @IsNotEmpty({
    message: 'You entered an incorrect price',
  })
  @Field(() => Number, { nullable: false })
  price: number;
}

@InputType()
export class BullsEyeBetsFilterPaginatedInput extends BetsFilterPaginatedInput {}
