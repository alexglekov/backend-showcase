import {
  ObjectType,
  Field,
} from '@nestjs/graphql';
import { GraphQLEntitiesNames } from '@xyro/core';
import { Bet1vs1, Game1vs1 } from '@prisma/client';
import { OneVsOneBetEntity } from '@xyro/contracts/one-vs-one';

import { OneVsOneGameGraphQLEntity } from '../../game/models/oneVsOneGameModel.type';


@ObjectType(GraphQLEntitiesNames.OneVsOneBet)
export class OneVsOneBetGraphQLEntity extends OneVsOneBetEntity {
  @Field(() => OneVsOneGameGraphQLEntity, { nullable: true })
  game: OneVsOneGameGraphQLEntity;

  fetchedGameFromDb?: Game1vs1;

  constructor(entity: Bet1vs1 & { game?: Game1vs1 }) {
    super(entity);

    this.fetchedGameFromDb = entity.game;
  }
}
