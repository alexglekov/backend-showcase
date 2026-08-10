import 'reflect-metadata';
import { Directive, ObjectType } from '@nestjs/graphql';
import { GraphQLEntitiesNames } from '@xyro/core';
import { CandleEntity } from '@xyro/contracts/candles';

@ObjectType(GraphQLEntitiesNames.Candle)
@Directive('@key(fields: "openTime")')
export class CandleGraphQLEntity extends CandleEntity {}
