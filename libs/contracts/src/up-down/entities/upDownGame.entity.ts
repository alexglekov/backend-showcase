import { Field, ObjectType } from '@nestjs/graphql';
import { GameUpDown } from '@prisma/client';
import { BaseGameEntity } from '@xyro/core';
import { IsBoolean, IsOptional, isBoolean } from 'class-validator';

@ObjectType({ isAbstract: true })
export class UpDownGameEntity extends BaseGameEntity {
  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  public readonly isUp?: boolean;

  constructor(game?: GameUpDown) {
    super(game);

    if (!game) return;

    this.isUp = isBoolean(game.isUp) ? game.isUp : undefined;
  }
}
