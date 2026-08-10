import { ObjectType, Field, Directive } from '@nestjs/graphql';
import { BetBullseye, GameBullseye } from '@prisma/client';
import { GraphQLEntitiesNames } from '@xyro/core';
import { BullsEyeGameEntity } from '@xyro/contracts/bulls-eye';

import { BullsEyeGamePoolInfoGraphQLEntity } from './bullsEyeGamePoolInfoModel.type';
import { BullsEyeBetGraphQLEntity } from '../../bets/models/bullsEyeBetGraphQLEntity';

@ObjectType(GraphQLEntitiesNames.BullsEyeGame)
@Directive('@key(fields: "id")')
export class BullsEyeGameGraphQLEntity extends BullsEyeGameEntity {
  @Field(() => BullsEyeBetGraphQLEntity, { nullable: true })
  public readonly winnerBet: BullsEyeBetGraphQLEntity;

  @Field(() => BullsEyeBetGraphQLEntity, { nullable: true })
  @Directive('@shareable')
  public readonly myBet?: BullsEyeBetGraphQLEntity;

  @Field(() => [BullsEyeBetGraphQLEntity])
  public readonly bets: BullsEyeBetGraphQLEntity[];

  @Field(() => BullsEyeGamePoolInfoGraphQLEntity)
  public readonly pool: BullsEyeGamePoolInfoGraphQLEntity;

  fetchedBetsFromDb?: BetBullseye[];

  constructor(game: GameBullseye & { bets?: BetBullseye[] }) {
    super(game);

    this.fetchedBetsFromDb = game.bets;
  }
}
