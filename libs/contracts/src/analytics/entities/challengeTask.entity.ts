import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ChallengeTask, ChallengeTaskPattern } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

@ObjectType({ isAbstract: true })
export class ChallengeTaskEntity {
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

  @IsString()
  @IsNotEmpty()
  public readonly challengeId!: string;

  @IsNotEmpty()
  public readonly configuration?: object;

  @IsString()
  @IsOptional()
  public readonly blockedByTaskId?: string;

  @IsString()
  @IsEnum(ChallengeTaskPattern)
  @IsNotEmpty()
  public readonly pattern!: ChallengeTaskPattern;

  @IsNumber()
  @IsNotEmpty()
  @Field(() => Number, { nullable: false })
  public readonly reward!: number;

  constructor(task?: ChallengeTask) {
    if (!task) return;

    this.id = task.id;
    this.name = task.name;
    this.description = task.description;
    this.number = task.number;
    this.seasonId = task.seasonId;
    this.challengeId = task.challengeId;
    this.configuration = task.configuration ? task.configuration as any : undefined;
    this.blockedByTaskId = task.blockedByTaskId || undefined;
    this.pattern = task.pattern;
    this.reward = Number(task.reward);
  }
}
