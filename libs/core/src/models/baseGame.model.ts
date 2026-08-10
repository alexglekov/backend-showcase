import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Game, GameStateEnum, GameTypeEnum } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, isBoolean } from 'class-validator';

@ObjectType({ isAbstract: true })
export abstract class BaseGameEntity {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  public readonly id!: string;

  @IsString()
  @IsEnum(GameTypeEnum)
  @IsNotEmpty()
  @Field(() => GameTypeEnum)
  public readonly type!: GameTypeEnum;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  public readonly assetId!: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @Field(() => Date, { nullable: true })
  public readonly startAt?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @Field(() => Date, { nullable: true })
  public readonly stopBetsAt?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @Field(() => Date, { nullable: true })
  public readonly endAt?: Date;

  @IsNumber()
  @IsOptional()
  @Field(() => Number, { nullable: true })
  public readonly startPrice?: number;

  @IsNumber()
  @IsOptional()
  @Field(() => Number, { nullable: true })
  public readonly endPrice?: number;

  @IsNumber()
  @IsOptional()
  @Field(() => Int, { nullable: true })
  public readonly timeframe?: number;

  @IsString()
  @IsEnum(GameStateEnum)
  @IsNotEmpty()
  @Field(() => GameStateEnum)
  public readonly state!: GameStateEnum;

  constructor(game?: Game) {
    if (!game) return;

    this.id = game.id;
    this.type = game.type;
    this.assetId = game.assetId;
    this.startAt = game.startAt ? new Date(game.startAt) : undefined;
    this.stopBetsAt = game.stopBetsAt ? new Date(game.stopBetsAt) : undefined;
    this.endAt = game.endAt ? new Date(game.endAt) : undefined;
    this.startPrice = game.startPrice ? Number(game.startPrice) : undefined;
    this.endPrice = game.endPrice ? Number(game.endPrice) : undefined;
    this.timeframe = game.timeframe;
    this.state = game.state;
  }
}
