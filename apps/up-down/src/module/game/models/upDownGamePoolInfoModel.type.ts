import {
  Field,
  ObjectType,
} from '@nestjs/graphql';
import { GraphQLEntitiesNames } from '@xyro/core';

import { UpDownBetGraphQLEntity } from '../../bets/models/upDownBetGraphQLEntity';

@ObjectType(GraphQLEntitiesNames.UpDownGamePoolInfo)
export class UpDownGamePoolInfoGraphQLEntity {
  @Field()
  betsCount: number;

  @Field()
  poolAmount: number;

  @Field(() => [UpDownBetGraphQLEntity])
  bets: UpDownBetGraphQLEntity[];
}
