import 'reflect-metadata';
import { Directive, ObjectType } from '@nestjs/graphql';
import { AssetPriceEntity } from '@xyro/contracts/prices';
import { GraphQLEntitiesNames } from '@xyro/core';

@ObjectType(GraphQLEntitiesNames.AssetPrice)
@Directive('@key(fields: "id")')
export class AssetPriceGraphQLEntity extends AssetPriceEntity {}
