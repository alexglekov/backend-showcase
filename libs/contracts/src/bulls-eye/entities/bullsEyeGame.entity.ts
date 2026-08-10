import { Field, ObjectType } from '@nestjs/graphql';
import { GameBullseye } from '@prisma/client';
import { BaseGameEntity } from '@xyro/core';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

@ObjectType({ isAbstract: true })
export class BullsEyeGameEntity extends BaseGameEntity {
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  public readonly winnerBetId?: string;

  @IsNumber()
  @IsNotEmpty()
  @Field(() => Number, { nullable: false })
  public readonly amount!: number;

  constructor(game?: GameBullseye) {
    super(game);

    if (!game) return;

    this.winnerBetId = game.winnerBetId || undefined;
    this.amount = Number(game.amount);
  }
}
