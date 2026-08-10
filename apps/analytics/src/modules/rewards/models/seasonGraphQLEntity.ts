import { Directive, Field, Int, ObjectType } from '@nestjs/graphql';
import { SeasonEntity } from '@xyro/contracts/analytics';
import { GraphQLEntitiesNames } from '@xyro/core';
import { ChallengeTask, Season, SeasonChallenge } from '@prisma/client';

import { SeasonChallengeGraphQLEntity } from './seasonChallengeGraphQLEntity';

type SeasonChallengeWithTasks = SeasonChallenge & {
  tasks: ChallengeTask[]
}

type SeasonWithChallenges = Season & {
  challenges: SeasonChallengeWithTasks[]
}

@ObjectType(GraphQLEntitiesNames.Season)
@Directive('@key(fields: "id")')
export class SeasonGraphQLEntity extends SeasonEntity {
  @Field(() => [SeasonChallengeGraphQLEntity])
  public readonly challenges: SeasonChallengeGraphQLEntity[];

  @Field(() => Int)
  public readonly countCompletedChallegnes: number;

  fetchedChallengesFromDb?: SeasonChallenge[];

  constructor(season?: SeasonWithChallenges) {
    super(season);

    if (!season) return;

    this.fetchedChallengesFromDb = season.challenges;
    this.challenges = season.challenges
      .sort((challenge1, challenge2) => challenge1.number - challenge2.number)
      .map((challenge) => new SeasonChallengeGraphQLEntity(challenge));


    this.countCompletedChallegnes = this.challenges
      .filter((challenge) => challenge.isCompleted)
      .length;
  }
}
