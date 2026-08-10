import { ObjectType, Field } from '@nestjs/graphql';
import { GraphQLEntitiesNames } from '@xyro/core';
import { AssetEntity } from '@xyro/contracts/prices';

import { AssetPriceRichType } from './common.types';
import { AssetPriceGraphQLEntity } from './assetPriceGraphQLEntity.type';

@ObjectType(GraphQLEntitiesNames.Asset)
export class AssetGraphQLEntity extends AssetEntity {
  @Field(() => AssetPriceGraphQLEntity)
  price: AssetPriceGraphQLEntity;

  @Field(() => [Number])
  last7days: number[];

  @Field(() => Number)
  price24h: number;

  constructor(entity: AssetPriceRichType) {
    super(entity);

    this.price = new AssetPriceGraphQLEntity({
      ...entity,
      assetId: entity.id,
    });
  }
}
