import {
  ObjectType,
  Field,
  Directive,
} from '@nestjs/graphql';
import { Bet1vs1, Game1vs1 } from '@prisma/client';
import { GraphQLEntitiesNames } from '@xyro/core';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';
import { OneVsOneGameEntity } from '@xyro/contracts/one-vs-one';

import { OneVsOneBetGraphQLEntity } from '../../bets/models/oneVsOneBetModel.type';

@ObjectType(GraphQLEntitiesNames.OneVsOneGame)
@Directive('@key(fields: "id")')
export class OneVsOneGameGraphQLEntity extends OneVsOneGameEntity {
  @Field(() => UserGraphQLOrphanEntity)
  owner: UserGraphQLOrphanEntity;

  @Field(() => UserGraphQLOrphanEntity, { nullable: true })
  opponent: UserGraphQLOrphanEntity;

  @Field(() => [OneVsOneBetGraphQLEntity])
  bets: OneVsOneBetGraphQLEntity[];

  @Field(() => OneVsOneBetGraphQLEntity)
  ownerBet: OneVsOneBetGraphQLEntity;

  @Field(() => OneVsOneBetGraphQLEntity, { nullable: true })
  opponentBet: OneVsOneBetGraphQLEntity;

  fetchedBetsFromDb?: Bet1vs1[];

  constructor(entity: Game1vs1 & { bets?: Bet1vs1[] }) {
    super(entity);

    this.fetchedBetsFromDb = entity.bets;
  }
}
