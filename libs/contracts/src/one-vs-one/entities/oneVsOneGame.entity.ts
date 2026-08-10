import { Field, ObjectType } from '@nestjs/graphql';
import { DirectionEnum, Game1vs1 } from '@prisma/client';
import { BaseGameEntity } from '@xyro/core';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@ObjectType({ isAbstract: true })
export class OneVsOneGameEntity extends BaseGameEntity {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  public readonly ownerId!: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  public readonly opponentId?: string;

  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean)
  public readonly isPrivate!: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean)
  public readonly isExact!: boolean;

  @IsString()
  @IsEnum(DirectionEnum)
  @IsOptional()
  @Field(() => DirectionEnum, { nullable: true })
  public readonly direction?: DirectionEnum;

  constructor(game?: Game1vs1) {
    super(game);

    if (!game) return;

    this.ownerId = game.ownerId;
    this.opponentId = game.opponentId || undefined;
    this.isPrivate = game.isPrivate;
    this.isExact = game.isExact;
    this.direction = game.direction || undefined;
  }
}
