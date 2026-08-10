import { Field, Int, ObjectType } from '@nestjs/graphql';
import { X1000BetGraphQLOrphanEntity } from '@xyro/contracts/x1000';

@ObjectType('TodaysX1000Leaders')
export class TodaysX1000LeadersGraphQLEntity {
  @Field(() => [X1000BetGraphQLOrphanEntity])
  topByRoi: X1000BetGraphQLOrphanEntity[];

  @Field(() => [X1000BetGraphQLOrphanEntity])
  topByPnl: X1000BetGraphQLOrphanEntity[];

  @Field(() => Int, { nullable: true })
  userPositionRoi?: number;

  @Field(() => Int, { nullable: true })
  userPositionPnl?: number;

  constructor(payload: TodaysX1000LeadersGraphQLEntity) {
    this.topByPnl = payload.topByPnl;
    this.topByRoi = payload.topByRoi;
    this.userPositionPnl = payload.userPositionPnl;
    this.userPositionRoi = payload.userPositionRoi;
  }
}
