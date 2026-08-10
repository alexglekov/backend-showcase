import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GlobalBetsStatistics {
  @Field(() => Int)
  countDailyClosedGames: number;
}