import { Directive, Field, ObjectType } from '@nestjs/graphql';
import { ChallengeTask, UserChallengeTask, UserChallengeTaskStatus } from '@prisma/client';
import { ChallengeTaskEntity } from '@xyro/contracts/analytics';
import { GraphQLEntitiesNames } from '@xyro/core';

import { UserChallengeTaskGraphQLEntity } from './userChallengeTaskGraphQLEntity';

@ObjectType(GraphQLEntitiesNames.ChallengeTask)
@Directive('@key(fields: "id")')
export class ChallengeTaskGraphQLEntity extends ChallengeTaskEntity {
  @Field(() => UserChallengeTaskGraphQLEntity, { nullable: true })
  public readonly userRelatedTask?: UserChallengeTaskGraphQLEntity;

  @Field(() => String, { nullable: true })
  public override readonly description: string;

  @Field(() => Number, { nullable: true })
  public override readonly reward: number;

  @Field(() => Boolean)
  public readonly isCompleted: boolean;

  constructor(challengeTask?: ChallengeTask & { usersRelatedTasks?: UserChallengeTask[] }) {
    super(challengeTask);

    if (!challengeTask) return;

    this.isCompleted = false;
    const [userRelatedTask] = challengeTask.usersRelatedTasks ?? [];

    if (userRelatedTask && userRelatedTask.isActive) {
      this.userRelatedTask = new UserChallengeTaskGraphQLEntity(userRelatedTask);

      this.isCompleted = userRelatedTask.status !== UserChallengeTaskStatus.NOT_COMPLETED;
    } else {
      /**
       * Override fields because they should not be passed if the user has not reached this task
       */
      this.description = `You'll know after the previous task.`;
      this.reward = undefined as unknown as number;
    }
  }
}
