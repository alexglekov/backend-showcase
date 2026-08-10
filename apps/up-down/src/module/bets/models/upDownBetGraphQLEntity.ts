import {
  ObjectType,
  Field,
  Directive,
} from '@nestjs/graphql';
import { BetUpDown, GameUpDown } from '@prisma/client';
import { GraphQLEntitiesNames } from '@xyro/core';
import { UpDownBetEntity } from '@xyro/contracts/up-down';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';

import { UpDownGameGraphQLEntity } from '../../game/models/upDownGameModel.type';

@ObjectType(GraphQLEntitiesNames.UpDownBet)
@Directive('@key(fields: "id")')
export class UpDownBetGraphQLEntity extends UpDownBetEntity {
  @Field(() => UpDownGameGraphQLEntity, { nullable: true })
  game: UpDownGameGraphQLEntity;
  
  @Field(() => UserGraphQLOrphanEntity, { nullable: true })
  owner: UserGraphQLOrphanEntity;

  fetchedGameFromDb?: GameUpDown;

  constructor(bet: BetUpDown & { game?: GameUpDown }) {
    super(bet);

    this.fetchedGameFromDb = bet.game;
  }
}
