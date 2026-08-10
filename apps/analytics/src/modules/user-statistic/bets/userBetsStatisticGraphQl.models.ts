import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

@InputType('GetUserBetsStatisticInput')
export class GetUserBetsStatisticGraphQLInput {
  @Field({ nullable: false })
  userId: string;
}

@ObjectType('UserBetsStatistic')
export class UserBetsStatisticGraphQLEntity {
  @Field(() => Int)
  totalBets: number;

  @Field()
  totalBetsAmount: number;

  @Field()
  winrate: number;

  @Field()
  largestWin: number;

  constructor(payload: UserBetsStatisticGraphQLEntity) {
    this.largestWin = payload.largestWin;
    this.totalBets = payload.totalBets;
    this.winrate = payload.winrate;
    this.totalBetsAmount = payload.totalBetsAmount;
  }
}
