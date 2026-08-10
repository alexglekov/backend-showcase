import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class AssetPricesInput {
  @Field(() => String)
  id: string;

  @Field(() => Number)
  take: number;

  @Field(() => Number)
  skip: number;
}

@InputType()
export class AssetPricesRangeInput {
  @Field()
  assetId: string;

  @Field(() => Date)
  startDate: Date;

  @Field(() => Date)
  endDate: Date;
}
