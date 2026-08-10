import { ObjectType, Field } from '@nestjs/graphql';
import { BetTypeEnum, BetResultEnum, Bet, GameTypeEnum } from '@prisma/client';
import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsEnum, IsOptional, IsDate, isBoolean } from 'class-validator';
import { Type } from 'class-transformer';

@ObjectType({ isAbstract: true })
export abstract class BaseBetEntity {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  public readonly id!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  public readonly gameId!: string;

  @IsString()
  @IsEnum(GameTypeEnum)
  @IsNotEmpty()
  @Field(() => GameTypeEnum)
  public readonly gameType!: GameTypeEnum;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  public readonly ownerId!: string;

  @IsString()
  @IsEnum(BetTypeEnum)
  @IsNotEmpty()
  @Field(() => BetTypeEnum)
  public readonly type!: BetTypeEnum;

  @IsNumber()
  @IsOptional()
  @Field(() => Number)
  public readonly amount!: number;

  @IsNumber()
  @IsOptional()
  @Field(() => Number, { nullable: true })
  public readonly fee?: number;

  @IsNumber()
  @IsOptional()
  @Field(() => Number, { nullable: true })
  public readonly pnl?: number;

  @IsString()
  @IsNotEmpty()
  @Field(() => BetResultEnum)
  public readonly result!: BetResultEnum;

  @IsNumber()
  @IsOptional()
  @Field(() => Number, { nullable: true })
  public readonly outcome?: number;

  @IsNumber()
  @IsOptional()
  @Field(() => Number, { nullable: true })
  public readonly price?: number;

  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  public readonly isUp?: boolean;

  @IsNumber()
  @IsOptional()
  @Field(() => Number, { nullable: true })
  public readonly priceResult?: number;

  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  public readonly isUpResult?: boolean;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  @Field(() => Date)
  public readonly createdAt!: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  @Field(() => Date)
  public readonly updatedAt!: Date;

  @IsNumber()
  @IsNotEmpty()
  @Field(() => Number)
  public readonly multiplier!: number;

  constructor(bet?: Bet) {
    if (!bet) return;

    this.id = bet.id;
    this.gameId = bet.gameId;
    this.gameType = bet.gameType;
    this.ownerId = bet.ownerId;
    this.type = bet.type;
    this.amount = Number(bet.amount);
    this.fee = bet.fee ? Number(bet.fee) : undefined;
    this.pnl = bet.pnl ? Number(bet.pnl) : undefined;
    this.result = bet.result;
    this.outcome = bet.outcome ? Number(bet.outcome) : undefined;
    this.price = bet.price ? Number(bet.price) : undefined;
    this.isUp = isBoolean(bet.isUp) ? bet.isUp : undefined;
    this.priceResult = bet.priceResult ? Number(bet.priceResult) : undefined;
    this.isUpResult = isBoolean(bet.isUpResult) ? bet.isUpResult : undefined;
    this.createdAt = new Date(bet.createdAt);
    this.updatedAt = new Date(bet.updatedAt);
    this.multiplier = bet.multiplier;
  }
}
