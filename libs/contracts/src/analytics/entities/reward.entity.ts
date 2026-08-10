import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Reward } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

@ObjectType({ isAbstract: true })
export class RewardEntity {
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  public readonly id!: string

  @IsString()
  @IsNotEmpty()
  public readonly userId!: string

  @IsString()
  @IsNotEmpty()
  public readonly balanceId!: string

  @IsNumber()
  @IsNotEmpty()
  @Field(() => Number, { nullable: false })
  public readonly rewards!: number;

  @IsNumber()
  @IsNotEmpty()
  @Field(() => Number, { nullable: false })
  public readonly referralRewards!: number;

  @IsNumber()
  @IsOptional()
  @Field(() => Int, { nullable: true })
  public readonly lastPlace?: number;

  @IsNumber()
  @IsOptional()
  @Field(() => Int, { nullable: true })
  public readonly currentPlace?: number;

  constructor(reward?: Reward) {
    if (!reward) return;

    this.id = reward.id;
    this.userId = reward.userId;
    this.balanceId = reward.balanceId;
    this.rewards = Number(reward.rewards);
    this.referralRewards = Number(reward.referralRewards);
    this.lastPlace = reward.lastPlace ? Number(reward.lastPlace) : undefined;
    this.currentPlace = reward.currentPlace ? Number(reward.currentPlace) : undefined;
  }
}
