import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { DirectionEnum } from '@prisma/client';
import { GamesFilterPaginatedInput } from '@xyro/core';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

@InputType()
export class CreateOneVsOneGameInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  assetId: string;

  @Field()
  @IsNumber()
  @IsNotEmpty()
  timeframe: number;

  @Field()
  @IsBoolean()
  @IsNotEmpty()
  isPrivate: boolean;

  @Field()
  @IsBoolean()
  @IsNotEmpty()
  isExact: boolean;

  @Field(() => DirectionEnum, { nullable: true })
  @IsEnum(DirectionEnum)
  @IsOptional()
  direction?: DirectionEnum;

  @Field({ nullable: true })
  @IsString()
  @IsUUID('4')
  @IsOptional()
  opponentId?: string;

  @Field()
  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'You entered an incorrect amount, should be more than 1' })
  betAmount: number;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  betPrice?: number;
}

@ObjectType()
export class OneVsOneGamesCountType {
  @Field(() => Int)
  activeGamesCount: number;

  @Field(() => Int)
  closeGamesCount: number;

  @Field(() => Int)
  inviteGamesCount: number;
}

@InputType()
export class OneVsOneGamesFilterPaginatedInput extends GamesFilterPaginatedInput {
  @Field({ nullable: true, defaultValue: true })
  isOpen: boolean;
}
