import { ObjectType } from '@nestjs/graphql';
import { BaseGameEntity } from '@xyro/core';

@ObjectType({ isAbstract: true })
export class X1000GameEntity extends BaseGameEntity {}
