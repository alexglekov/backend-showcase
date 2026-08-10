import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { PaginatedGraphQLInput, PaginatedGraphQLOutput } from '@xyro/libs/graphql';
import { Bet } from '@prisma/client';

import { BetGraphQLEntity } from './betGraphQlEntity.model';

@InputType('GetBetsInput')
export class GetBetsGraphQLInput extends PaginatedGraphQLInput {
  @Field({ nullable: false })
  userId: string;

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

  @Field({ nullable: true, defaultValue: true })
  isActive: boolean;
}

@ObjectType('Bets')
export class BetsGraphQLEntity extends PaginatedGraphQLOutput {
  @Field(() => [BetGraphQLEntity])
  bets: BetGraphQLEntity[];

  constructor(bets: Bet[], total: number, take: number, skip: number) {
    super();

    this.bets = bets.map((bet) => new BetGraphQLEntity(bet));
    this.total = total;
    this.skip = skip;
    this.take = take;
  }
}

@ObjectType('CountActiveBettors')
export class CountActiveBettorsGraphQLEntity {
  @Field(() => Int)
  bullseye: number;

  @Field(() => Int)
  updown: number;

  @Field(() => Int)
  setup: number;

  @Field(() => Int)
  onevsone: number;

  @Field(() => Int)
  x1000: number;

  constructor(payload: CountActiveBettorsGraphQLEntity) {
    this.bullseye = payload.bullseye;
    this.onevsone = payload.onevsone;
    this.setup = payload.setup;
    this.x1000 = payload.x1000;
    this.updown = payload.updown;
  }
}
