import {
  Field,
  ObjectType,
} from '@nestjs/graphql';
import { GraphQLEntitiesNames } from '@xyro/core';

@ObjectType(GraphQLEntitiesNames.BullsEyeGamePoolInfo)
export class BullsEyeGamePoolInfoGraphQLEntity {
  @Field()
  betsCount: number;

  @Field()
  poolAmount: number;
}
