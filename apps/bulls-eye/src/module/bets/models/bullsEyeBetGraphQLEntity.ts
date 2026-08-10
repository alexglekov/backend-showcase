import {
  ObjectType,
  Field,
  Directive,
} from '@nestjs/graphql';
import { BetBullseye, GameBullseye } from '@prisma/client';
import { GraphQLEntitiesNames } from '@xyro/core';
import { BullsEyeBetEntity } from '@xyro/contracts/bulls-eye';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';

import { BullsEyeGameGraphQLEntity } from '../../game/models/bullsEyeGameModel.type';

@ObjectType(GraphQLEntitiesNames.BullsEyeBet)
@Directive('@key(fields: "id")')
export class BullsEyeBetGraphQLEntity extends BullsEyeBetEntity {
  @Field(() => BullsEyeGameGraphQLEntity, { nullable: true })
  game: BullsEyeGameGraphQLEntity;
  
  @Field(() => UserGraphQLOrphanEntity, { nullable: true })
  owner: UserGraphQLOrphanEntity;

  fetchedGameFromDb?: GameBullseye;

  constructor(bet: BetBullseye & { game?: GameBullseye }) {
    super(bet);

    this.fetchedGameFromDb = bet.game;
  }
}
