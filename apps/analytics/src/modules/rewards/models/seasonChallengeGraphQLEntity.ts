import { Directive, Field, ObjectType } from '@nestjs/graphql';
import { ChallengeTask, SeasonChallenge } from '@prisma/client';
import { SeasonChallengeEntity } from '@xyro/contracts/analytics';
import { GraphQLEntitiesNames } from '@xyro/core';

import { ChallengeTaskGraphQLEntity } from './challengeTaskGraphQLEntity';

type SeasonChallengeWithTasks = SeasonChallenge & {
  tasks: ChallengeTask[]
};

@ObjectType(GraphQLEntitiesNames.SeasonChallenge)
@Directive('@key(fields: "id")')
export class SeasonChallengeGraphQLEntity extends SeasonChallengeEntity {
  @Field(() => [ChallengeTaskGraphQLEntity])
  public readonly tasks: ChallengeTaskGraphQLEntity[];

  @Field(() => Boolean)
  public readonly isCompleted: boolean;

  fetchedTasksFromDb?: ChallengeTask[];

  constructor(challenge?: SeasonChallengeWithTasks) {
    super(challenge);

    if (!challenge) return;

    this.fetchedTasksFromDb = challenge.tasks;
    this.tasks = challenge.tasks
      .sort((task1, task2) => task1.number - task2.number)
      .map((task) => new ChallengeTaskGraphQLEntity(task))

    this.isCompleted = this.tasks.every((task) => task.isCompleted);
  }
}
