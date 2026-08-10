import { InputType, Field } from '@nestjs/graphql';
import { BetsFilterPaginatedInput } from '@xyro/core';
import { IsBoolean, IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';

@InputType()
export class AddUpDownBetInput {
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

  @Field({ nullable: false })
  @IsBoolean({
    message: `You didn't chose side up/down`
  })
  @IsNotEmpty({
    message: `You didn't chose side up/down`
  })
  isUp: boolean;

  @Field({ nullable: false })
  @IsNumber(undefined, {
    message: 'You entered an incorrect amount',
  })
  @Min(1, {
    message: 'You entered an incorrect amount',
  })
  @IsNotEmpty({
    message: 'You entered an incorrect amount',
  })
  amount: number;
}

@InputType()
export class UpDownBetsFilterPaginatedInput extends BetsFilterPaginatedInput {}
