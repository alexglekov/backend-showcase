import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('DashboardData')
export class DashboardDataType {
  @Field()
  date: string;

  @Field()
  from: string;

  @Field()
  to: string;

  @Field()
  activeUsers: number;

  @Field()
  userBets: number;

  @Field()
  totalBets: number;

  @Field()
  income: number;
}
