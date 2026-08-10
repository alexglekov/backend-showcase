import {
  Directive,
  Field,
  ObjectType,
} from '@nestjs/graphql';
import { GraphQLEntitiesNames } from '@xyro/core';
import { SetupBetEntity } from '@xyro/contracts/setups';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';

import { SetupGameGraphQLEntity } from '../../games/graphql-models/setupGameGraphQLEntity';

@ObjectType(GraphQLEntitiesNames.SetupBet)
@Directive('@key(fields: "gameId ownerId")')
export class SetupBetGraphQLEntity extends SetupBetEntity {
  @Field(() => SetupGameGraphQLEntity)
  game: SetupGameGraphQLEntity;

  @Field(() => UserGraphQLOrphanEntity, { nullable: true })
  owner: UserGraphQLOrphanEntity;
}
