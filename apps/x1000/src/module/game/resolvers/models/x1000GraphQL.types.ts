import { InputType, Field, ObjectType, Int } from '@nestjs/graphql';
import { FeeTypeEnum } from '@prisma/client';
import { Max, Min } from 'class-validator';
import { GamesFilterPaginatedInput, OrderBy } from '@xyro/core';

@InputType()
export class AddX1000BetInput {
  @Field()
  @Min(1)
  @Max(1000)
  multiplier: number;

  @Field()
  @Min(1)
  amount: number;

  @Field()
  isLong: boolean;

  @Field({ nullable: true })
  takeProfit?: number;

  @Field({ nullable: true })
  stopLoss?: number;

  @Field(() => FeeTypeEnum, {
    defaultValue: FeeTypeEnum.PNL_FEE,
    nullable: true,
  })
  feeType: FeeTypeEnum;
}

@ObjectType()
export class X1000GamesCounters {
  @Field(() => Number)
  active: number;

  @Field(() => Number)
  closed: number;
}

@InputType()
export class X1000GamesFilterPaginatedInput extends GamesFilterPaginatedInput {
  @Field(() => OrderBy, { nullable: true })
  pnl: OrderBy;

  @Field(() => OrderBy, { nullable: true })
  roi: OrderBy;

  @Field(() => OrderBy, { nullable: true })
  isUp: OrderBy;

  @Field(() => OrderBy, { nullable: true })
  endPrice: OrderBy;

  @Field(() => OrderBy, { nullable: true })
  multiplier: OrderBy;

  @Field(() => OrderBy, { nullable: true })
  burnPrice: OrderBy;

  @Field(() => OrderBy, { nullable: true })
  startPrice: OrderBy;

  @Field(() => OrderBy, { nullable: true })
  amount: OrderBy;
}

@InputType()
export class X1000GamesPaginatedInput extends GamesFilterPaginatedInput {}
