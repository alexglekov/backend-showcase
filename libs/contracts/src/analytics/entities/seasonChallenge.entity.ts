import { Field, Int, ObjectType } from '@nestjs/graphql';
import { SeasonChallenge } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@ObjectType({ isAbstract: true })
export class SeasonChallengeEntity {
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  public readonly id!: string

  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  public readonly name!: string

  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  public readonly description!: string

  @IsString()
  @IsNotEmpty()
  public readonly seasonId!: string

  @IsNumber()
  @IsNotEmpty()
  @Field(() => Int, { nullable: false })
  public readonly number!: number;

  constructor(challenge?: SeasonChallenge) {
    if (!challenge) return;

    this.id = challenge.id;
    this.name = challenge.name;
    this.description = challenge.description;
    this.number = challenge.number;
    this.seasonId = challenge.seasonId;
  }
}
