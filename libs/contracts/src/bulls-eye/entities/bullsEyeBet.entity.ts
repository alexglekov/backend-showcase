import { Field, Int, ObjectType } from '@nestjs/graphql';
import { BetBullseye } from '@prisma/client';
import { BaseBetEntity } from '@xyro/core';
import { IsBoolean, IsNumber, IsOptional, isBoolean } from 'class-validator';

@ObjectType({ isAbstract: true })
export class BullsEyeBetEntity extends BaseBetEntity {
  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  public readonly isExact?: boolean;

  @IsNumber()
  @IsOptional()
  @Field(() => Int, { nullable: true })
  public readonly place?: number;

  constructor(bet?: BetBullseye) {
    super(bet);

    if (!bet) return;

    this.isExact = isBoolean(bet.isExact) ? bet.isExact : undefined;
    this.place = bet.place || undefined;
  }
}
