import { ObjectType, Field, Directive } from '@nestjs/graphql';
import { BetUpDown, GameUpDown } from '@prisma/client';
import { GraphQLEntitiesNames } from '@xyro/core';
import { UpDownGameEntity } from '@xyro/contracts/up-down';

import { UpDownGamePoolInfoGraphQLEntity } from './upDownGamePoolInfoModel.type';
import { UpDownBetGraphQLEntity } from '../../bets/models/upDownBetGraphQLEntity';


@ObjectType(GraphQLEntitiesNames.UpDownGame)
@Directive('@key(fields: "id")')
export class UpDownGameGraphQLEntity extends UpDownGameEntity {
  @Field(() => UpDownBetGraphQLEntity, { nullable: true })
  @Directive('@shareable')
  myBet?: UpDownBetGraphQLEntity;

  @Field(() => [UpDownBetGraphQLEntity])
  bets: UpDownBetGraphQLEntity[];

  @Field(() => UpDownGamePoolInfoGraphQLEntity, { nullable: false })
  upPool: UpDownGamePoolInfoGraphQLEntity;

  @Field(() => UpDownGamePoolInfoGraphQLEntity, { nullable: false })
  downPool: UpDownGamePoolInfoGraphQLEntity;

  fetchedBetsFromDb?: BetUpDown[];

  constructor(game: GameUpDown & { bets?: BetUpDown[] }) {
    super(game);

    this.fetchedBetsFromDb = game.bets;
  }
}
