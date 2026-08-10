import { Directive, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLEntitiesNames } from '@xyro/core';
import { BetSetup } from '@prisma/client';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@ObjectType(GraphQLEntitiesNames.SetupGame)
@Directive('@key(fields: "id")')
export class SetupGameGraphQLOrphanEntity {
  @Field()
  id: string;

  public readonly __typename!: GraphQLEntitiesNames;

  constructor(payload: Pick<BetSetup, 'id'>) {
    this.id = payload.id;
    this.__typename = GraphQLEntitiesNames.SetupGame;
  }
}

@ObjectType(GraphQLEntitiesNames.SetupBet)
@Directive('@key(fields: "gameId ownerId")')
export class SetupBetGraphQLOrphanEntity {
  @IsString()
  @IsUUID('4')
  @IsNotEmpty()
  @Field(() => String)
  public readonly gameId: string;

  @IsString()
  @IsUUID('4')
  @IsNotEmpty()
  @Field(() => String)
  public readonly ownerId: string;

  public readonly __typename!: GraphQLEntitiesNames;

  constructor(entity: Pick<BetSetup, 'gameId' | 'ownerId'>) {
    this.gameId = entity.gameId;
    this.ownerId = entity.ownerId;
    this.__typename = GraphQLEntitiesNames.SetupBet;
  }
}
