import { Directive, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLEntitiesNames } from '@xyro/core';
import { Bet, Game } from '@prisma/client';
import { BetEntity } from '@xyro/contracts/analytics';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';

import { GameGraphQLEntity } from '../../game/graphql-models';

@ObjectType(GraphQLEntitiesNames.Bet)
@Directive('@key(fields: "id")')
export class BetGraphQLEntity extends BetEntity {
  @Field(() => GameGraphQLEntity)
  game: GameGraphQLEntity;

  @Field(() => UserGraphQLOrphanEntity, { nullable: true })
  owner: UserGraphQLOrphanEntity;

  fetchedGameFromDb?: Game;

  constructor(entity: Bet & { game?: Game }) {
    super(entity);
    this.fetchedGameFromDb = entity.game;
  }
}
