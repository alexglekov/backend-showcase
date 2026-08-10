import { Directive, Field, ObjectType } from '@nestjs/graphql';
import { SetupBetGraphQLOrphanEntity, SetupGameEntity } from '@xyro/contracts/setups';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';
import { GraphQLEntitiesNames } from '@xyro/core';

import {
  TSetupGamePoolInfo,
  TSetupGamePoolsInfo,
  TSetupGameWithPoolsEnfo
} from '../services/typings';
import { SetupBetGraphQLEntity } from '../../bets/graphql-models/setupBetGraphQLEntity';

@ObjectType(GraphQLEntitiesNames.SetupGamePoolInfo)
export class SetupGamePoolInfoGraphQLEntity implements TSetupGamePoolInfo {
  @Field()
  amount: number;

  @Field()
  count: number;

  @Field()
  multiplier: number;
}

@ObjectType(GraphQLEntitiesNames.SetupGame)
@Directive('@key(fields: "id")')
export class SetupGameGraphQLEntity extends SetupGameEntity implements TSetupGamePoolsInfo {
  @Field(() => UserGraphQLOrphanEntity, { nullable: true })
  public readonly owner: UserGraphQLOrphanEntity;

  @Field(() => SetupGamePoolInfoGraphQLEntity)
  public readonly takeProfitPool: SetupGamePoolInfoGraphQLEntity;

  @Field(() => SetupGamePoolInfoGraphQLEntity)
  public readonly stopLossPool: SetupGamePoolInfoGraphQLEntity;

  @Field(() => SetupBetGraphQLEntity, { nullable: true })
  @Directive('@shareable')
  public readonly myBet?: SetupBetGraphQLOrphanEntity;

  constructor(entity?: TSetupGameWithPoolsEnfo) {
    super(entity);

    if (!entity) return;

    this.takeProfitPool = entity.takeProfitPool;
    this.stopLossPool = entity.stopLossPool;
  }
}
