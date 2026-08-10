import { ObjectType } from '@nestjs/graphql';
import { GameEntity } from '@xyro/contracts/analytics';
import { GraphQLEntitiesNames } from '@xyro/core';

@ObjectType(GraphQLEntitiesNames.Game)
export class GameGraphQLEntity extends GameEntity {}
