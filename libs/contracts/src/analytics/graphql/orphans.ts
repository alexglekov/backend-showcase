import { Directive, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLEntitiesNames } from '@xyro/core';

import {
  BetGraphQLEntityReference, RewardGraphQLEntityReference, SeasonGraphQLEntityReference
} from './references';

@ObjectType(GraphQLEntitiesNames.Bet)
@Directive('@key(fields: "id")')
export class BetGraphQLOrphanEntity {
  @Field()
  id: string;

  constructor(payload: BetGraphQLOrphanEntity) {
    this.id = payload.id;
  }

  public static createReference(id: string): BetGraphQLEntityReference {
    return {
      id,
      __typename: GraphQLEntitiesNames.Bet,
    }
  }
}

@ObjectType(GraphQLEntitiesNames.Season)
@Directive('@key(fields: "id")')
export class SeasonGraphQLOrphanEntity {
  @Field()
  id: string;

  constructor(payload: SeasonGraphQLOrphanEntity) {
    this.id = payload.id;
  }

  public static createReference(id: string): SeasonGraphQLEntityReference {
    return {
      id,
      __typename: GraphQLEntitiesNames.Season,
    }
  }
}

@ObjectType(GraphQLEntitiesNames.Reward)
@Directive('@key(fields: "id")')
export class RewardGraphQLOrphanEntity {
  @Field()
  id: string;

  constructor(payload: RewardGraphQLOrphanEntity) {
    this.id = payload.id;
  }

  public static createReference(id: string): RewardGraphQLEntityReference {
    return {
      id,
      __typename: GraphQLEntitiesNames.Reward,
    }
  }
}
