import {
  ObjectType,
  Field,
  Resolver,
  ResolveField,
  Parent,
  Directive,
  ResolveReference,
} from '@nestjs/graphql';
import { PrivacyPolicies } from '@xyro/core';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';
import { GraphQLEntitiesNames } from '@xyro/core';
import { BetX1000, GameX1000 } from '@prisma/client';
import { X1000BetEntity, X1000BetGraphQLEntityReference } from '@xyro/contracts/x1000';

import { X1000GameGraphQLEntity } from './x1000GameModel.type';
import { PrismaService } from '../../../../infrastructure/prisma';

@ObjectType(GraphQLEntitiesNames.X1000Bet)
@Directive('@key(fields: "id")')
export class X1000BetGraphQLEntity extends X1000BetEntity {
  @Field(() => X1000GameGraphQLEntity, { nullable: false })
  game: X1000GameGraphQLEntity;

  @Field(() => UserGraphQLOrphanEntity, { nullable: true })
  owner: UserGraphQLOrphanEntity;

  fetchedGameFromDb?: GameX1000;

  constructor(entity: BetX1000 & { game?: GameX1000 }) {
    super(entity);

    this.fetchedGameFromDb = entity.game;
  }
}

@Resolver(() => X1000BetGraphQLEntity)
export class X1000BetGraphQLEntityResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @ResolveField(() => X1000GameGraphQLEntity, { name: 'game' })
  async game(@Parent() bet: X1000BetGraphQLEntity) {
    let game: GameX1000 | null;

    if (bet.fetchedGameFromDb) {
      game = bet.fetchedGameFromDb;
    } else {
      game = await this.prismaService.gameX1000.findFirst({
        where: {
          id: bet.gameId,
        },
      });
    }

    return game ? new X1000GameGraphQLEntity(game) : null;
  }

  @ResolveField(() => UserGraphQLOrphanEntity, { name: 'owner', nullable: true })
  owner(@Parent() bet: X1000BetGraphQLEntity) {
    return new UserGraphQLOrphanEntity({
      id: bet.ownerId,
      request: [PrivacyPolicies.showProfile],
    });
  }

  // TODO: n+1 problem task BE-82
  @ResolveReference()
  async resolveReference(reference: X1000BetGraphQLEntityReference) {
    const bet = await this.prismaService.betX1000.findFirst({
      where: {
        id: reference.id,
      }
    });

    return bet ? new X1000BetGraphQLEntity(bet) : null;
  }  
}
