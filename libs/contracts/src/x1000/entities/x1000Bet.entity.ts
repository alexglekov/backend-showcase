import { Field, ObjectType } from '@nestjs/graphql';
import { BetX1000, FeeTypeEnum } from '@prisma/client';
import { BaseBetEntity } from '@xyro/core';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

@ObjectType({ isAbstract: true })
export class X1000BetEntity extends BaseBetEntity {
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean)
  public readonly isLong!: boolean;

  @IsNumber()
  @IsOptional()
  @Field(() => Number, { nullable: true })
  public readonly takeProfit?: number;

  @IsNumber()
  @IsOptional()
  @Field(() => Number, { nullable: true })
  public readonly stopLoss?: number;

  @IsNumber()
  @IsNotEmpty()
  @Field(() => Number, { nullable: true })
  public readonly burnPrice?: number;

  @IsString()
  @IsEnum(FeeTypeEnum)
  @IsNotEmpty()
  @Field(() => FeeTypeEnum)
  public readonly feeType!: FeeTypeEnum;

  @IsNumber()
  @IsOptional()
  @Field(() => Number, { nullable: true })
  public readonly roi?: number;

  constructor(bet?: BetX1000) {
    super(bet);

    if (!bet) return;

    this.isLong = bet.isLong;
    this.takeProfit = bet.takeProfit ? Number(bet.takeProfit) : undefined;
    this.stopLoss = bet.stopLoss ? Number(bet.stopLoss) : undefined;
    this.burnPrice = bet.burnPrice ? Number(bet.burnPrice) : undefined;
    this.feeType = bet.feeType;
    this.roi = bet.roi ? Number(bet.roi) : undefined;
  }
}
