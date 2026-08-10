import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsNumber, IsDate } from 'class-validator';
import { CandleRaw } from 'libs/columnDb/src/port';

@ObjectType({ isAbstract: true })
export class CandleEntity {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  public readonly assetId!: string;

  @IsNumber()
  @IsNotEmpty()
  @Field(() => Int)
  public readonly timeframe!: number;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  @Field(() => Date)
  public readonly openTime!: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  @Field(() => Date)
  public readonly closeTime!: Date;

  @IsNumber()
  @IsNotEmpty()
  @Field(() => Number)
  public readonly high!: number;

  @IsNumber()
  @IsNotEmpty()
  @Field(() => Number)
  public readonly low!: number;

  @IsNumber()
  @IsNotEmpty()
  @Field(() => Number)
  public readonly open!: number;

  @IsNumber()
  @IsNotEmpty()
  @Field(() => Number)
  public readonly close!: number;

  constructor(candle?: CandleRaw) {
    if (!candle) return;

    this.assetId = candle.assetid;
    this.timeframe = candle.timeframe;
    this.openTime = new Date(candle.opentime);
    this.closeTime = new Date(candle.closetime);
    this.open = Number(candle.open);
    this.close = Number(candle.close);
    this.high = Number(candle.high);
    this.low = Number(candle.low);
  }

  toRaw(): CandleRaw {
    return {
      assetid: this.assetId,
      timeframe: this.timeframe,
      open: this.open,
      close: this.close,
      high: this.high,
      low: this.low,
      opentime: this.openTime,
      closetime: this.closeTime,
    };
  }
}
