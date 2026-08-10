import { Args, Query, Resolver } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';

import { BalanceGraphQLEntity } from './models/balanceGraphqlEntity.model';
import { WalletsService } from '../wallet.service';
import {
  BalanceOperationsGraphQLEntity,
  GetBalanceHistoryGraphQLInput,
  GetBalanceOperationsGraphQLInput
} from './models/balanceGraphqlModels';

@Resolver()
export class WalletsResolver {
  constructor(
    private readonly walletService: WalletsService
  ) {}

  @Query(() => BalanceGraphQLEntity)
  async getUserBalance(@UserCredentials() credentials: IUserCredentials) {
    const { userId } = credentials;

    const userBalance = await this.walletService.getUserBalance({ userId });

    return new BalanceGraphQLEntity(userBalance);
  }

  @Query(() => BalanceOperationsGraphQLEntity)
  async getUserBalanceOperations(
    @UserCredentials() credentials: IUserCredentials,
    @Args('input') input: GetBalanceOperationsGraphQLInput,
  ): Promise<BalanceOperationsGraphQLEntity> {
    const { userId } = credentials;

    const { entries, skip, take, total, } = await this.walletService.getUserBalanceOperations({
      userId,
      skip: input.skip,
      take: input.take,
      gameMode: input.gameMode,
      type: input.type,
    });

    return new BalanceOperationsGraphQLEntity(entries, take, skip, total);
  }

  @Query(() => [BalanceGraphQLEntity])
  async getUserBalanceHistory(
    @UserCredentials() credentials: IUserCredentials,
    @Args('input') input: GetBalanceHistoryGraphQLInput,
  ): Promise<BalanceGraphQLEntity[]> {
    const { userId } = credentials;

    const entries = await this.walletService.getUserBalanceHistory({
      userId,
      startDate: input.startDate,
      endDate: input.endDate,
    });

    return entries.map((entry) => new BalanceGraphQLEntity(entry));
  }
}