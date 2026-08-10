import { Field, ObjectType } from '@nestjs/graphql';
import { GameSetup, GameSetupResultEnum } from '@prisma/client';
import { BaseGameEntity } from '@xyro/core';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

@ObjectType({ isAbstract: true })
export class SetupGameEntity extends BaseGameEntity {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  public readonly ownerId!: string;

  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean)
  public readonly isLong!: boolean;

  @IsNumber()
  @IsNotEmpty()
  @Field(() => Number)
  public readonly takeProfit!: number;

  @IsNumber()
  @IsNotEmpty()
  @Field(() => Number)
  public readonly stopLoss!: number;

  @IsNumber()
  @IsOptional()
  @Field(() => Number, { nullable: true })
  public readonly ownerProfit?: number;

  @IsString()
  @IsEnum(GameSetupResultEnum)
  @IsOptional()
  @Field(() => GameSetupResultEnum, { nullable: true })
  public readonly result?: GameSetupResultEnum;

  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean)
  public readonly isTrusted!: boolean;

  constructor(game?: GameSetup) {
    super(game);

    if (!game) return;

    this.ownerId = game.ownerId;
    this.isLong = game.isLong;
    this.takeProfit = Number(game.takeProfit);
    this.stopLoss = Number(game.stopLoss);
    this.isTrusted = game.isTrusted;
    this.result = game.result || undefined;
    this.ownerProfit = game.ownerProfit ? Number(game.ownerProfit) : undefined;
  }
}
