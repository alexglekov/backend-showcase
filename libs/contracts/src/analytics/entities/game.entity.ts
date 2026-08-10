import { ObjectType } from '@nestjs/graphql';
import { BaseGameEntity } from '@xyro/core';

@ObjectType({ isAbstract: true })
export abstract class GameEntity extends BaseGameEntity {}
