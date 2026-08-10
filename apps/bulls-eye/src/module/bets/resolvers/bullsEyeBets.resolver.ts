import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';

import { BullsEyeBetsService } from '../bullsEyeBets.service';
import { BullsEyeBetGraphQLEntity } from '../models/bullsEyeBetGraphQLEntity';
import { AddBullsEyeBetInput, BullsEyeBetsFilterPaginatedInput } from '../models/graphqlModels';

@Resolver()
export class BullsEyeBetsResolver {
  constructor(
    private readonly BullsEyeBetsService: BullsEyeBetsService,
  ) {}

  @Mutation(() => BullsEyeBetGraphQLEntity)
  async addBullsEyeBet(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') data: AddBullsEyeBetInput,
  ): Promise<BullsEyeBetGraphQLEntity | null> {
    const { userId } = credentials;

    const bet = await this.BullsEyeBetsService.addBet({
      price: data.price,
      gameId: data.gameId,
      userId,
    });

    return new BullsEyeBetGraphQLEntity(bet);
  }

  @Query(() => [BullsEyeBetGraphQLEntity])
  async getUserBullsEyeBets(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') data: BullsEyeBetsFilterPaginatedInput,
  ) {
    const { userId } = credentials;

    const bets = await this.BullsEyeBetsService.getBullsEyeBetsPaginated({
      ownerId: userId,
      ...data,
    });

    return bets.map((bet) => new BullsEyeBetGraphQLEntity(bet));
  }

}
