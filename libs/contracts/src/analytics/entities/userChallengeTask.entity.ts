import { Field, ObjectType } from '@nestjs/graphql';
import { UserChallengeTask, UserChallengeTaskStatus } from '@prisma/client';
import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';

@ObjectType({ isAbstract: true })
export class UserChallengeTaskEntity {
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  public readonly id!: string

  @IsString()
  @IsNotEmpty()
  public readonly seasonId!: string

  @IsString()
  @IsNotEmpty()
  public readonly challengeId!: string;

  @IsBoolean()
  @IsNotEmpty()
  public readonly isActive!: boolean;

  @IsString()
  @IsNotEmpty()
  public readonly userId!: string;

  @IsString()
  @IsEnum(UserChallengeTaskStatus)
  @IsNotEmpty()
  @Field(() => UserChallengeTaskStatus)
  public readonly status!: UserChallengeTaskStatus;
  
  constructor(task?: UserChallengeTask) {
    if (!task) return;

    this.id = task.id;
    this.seasonId = task.seasonId;
    this.challengeId = task.challengeId;
    this.userId = task.userId;
    this.status = task.status;
    this.isActive = task.isActive;
  }
}
