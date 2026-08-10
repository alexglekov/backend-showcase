import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ListCandlesInput {
  @Field()
  assetId: string;

  @Field()
  timeframe: number;

  @Field(() => Date)
  startDate: Date;

  @Field(() => Date)
  endDate: Date;
}
