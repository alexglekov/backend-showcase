import {
  Field,
  InputType,
} from '@nestjs/graphql';

@InputType()
export class BetsFilterPaginatedInput {
  @Field({ defaultValue: 0, nullable: true })
  skip?: number;

  @Field({ defaultValue: 5, nullable: true })
  take?: number;

  @Field({ nullable: true })
  betMin?: number;

  @Field({ nullable: true })
  betMax?: number;

  @Field({ nullable: true })
  profitMin?: number;

  @Field({ nullable: true })
  profitMax?: number;

  @Field({ nullable: true })
  latest?: boolean;

  @Field({ nullable: true })
  isActive?: boolean;
}

@InputType()
export class GamesFilterPaginatedInput {
  @Field({ nullable: true, defaultValue: true, })
  isActive!: boolean;

  @Field({ defaultValue: 0, nullable: true })
  skip?: number;

  @Field({ defaultValue: 5, nullable: true })
  take?: number;
}
