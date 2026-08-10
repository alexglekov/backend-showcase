import {
  ObjectType,
  Resolver,
  ResolveField,
  Parent,
  Field,
  Directive,
} from '@nestjs/graphql';
import { BetX1000, GameX1000 } from '@prisma/client';
import { GraphQLEntitiesNames } from '@xyro/core';
import { X1000GameEntity } from '@xyro/contracts/x1000';

import { X1000BetGraphQLEntity } from './x1000BetModel.type';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

@ObjectType(GraphQLEntitiesNames.X1000Game)
@Directive('@key(fields: "id")')
export class X1000GameGraphQLEntity extends X1000GameEntity {
  @Field(() => X1000BetGraphQLEntity, { nullable: false })
  bet: X1000BetGraphQLEntity;

  fetchedBetsFromDb?: BetX1000[];

  constructor(entity: GameX1000 & { bets?: BetX1000[] }) {
    super(entity as any);

    this.fetchedBetsFromDb = entity.bets;
  }
}

@Resolver(() => X1000GameGraphQLEntity)
export class X1000GameGraphQLEntityResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @ResolveField(() => [X1000BetGraphQLEntity], { name: 'bet', nullable: false })
  async bet(@Parent() game: X1000GameGraphQLEntity) {
    let bets: BetX1000[];

    if (game.fetchedBetsFromDb) {
      bets = game.fetchedBetsFromDb;
    } else {
      bets = await this.prismaService.betX1000.findMany({
        where: {
          gameId: game.id,
        },
      });
    }

    const [bet] = bets;
    return new X1000BetGraphQLEntity(bet);
  }
}
