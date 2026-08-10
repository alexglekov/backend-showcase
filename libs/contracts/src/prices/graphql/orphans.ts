import { Directive, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLEntitiesNames } from '@xyro/core';

import {
  AssetGraphQLEntityReference,
  AssetPriceGraphQLEntityReference
} from './references';

@ObjectType(GraphQLEntitiesNames.AssetPrice)
@Directive('@key(fields: "id")')
export class AssetPriceGraphQLOrphanEntity {
  @Field(() => String, { nullable: true })
  id: string;

  constructor(payload: AssetPriceGraphQLOrphanEntity) {
    this.id = payload.id;
  }

  public static createReference(id: string): AssetPriceGraphQLEntityReference {
    return {
      id,
      __typename: GraphQLEntitiesNames.AssetPrice,
    }
  }
}

@ObjectType(GraphQLEntitiesNames.Asset)
@Directive('@key(fields: "id")')
export class AssetGraphQLOrphanEntity {
  @Field()
  id: string;

  constructor(payload: AssetGraphQLOrphanEntity) {
    this.id = payload.id;
  }

  public static createReference(id: string): AssetGraphQLEntityReference {
    return {
      id,
      __typename: GraphQLEntitiesNames.Asset,
    }
  }
}
