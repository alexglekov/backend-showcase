import { Args, Query, Resolver } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';

import { BalanceHistoryEntryGraphQLEntity } from './models/walletGraphqlEntities.models';
import {
  GetByUserInput,
  GetUserBalanceHistoryEntriesInput,
  UserBalanceHistoryEntries,
  UserWalletStatisticGraphqlEntity,
} from './models/graphqlInputs';
import { WalletsService } from '../wallets.service';
import { PermissionsEnum, UsePermissions } from '../../iam/permissions';

@Resolver()
export class WalletsResolver {
  constructor(private readonly walletsService: WalletsService) {}

  @Query(() => UserBalanceHistoryEntries)
  @UsePermissions([PermissionsEnum.userBalanceHistory])
  async getUserBalanceHistoryEntries(
    @UserCredentials() _credentials: IUserCredentials,
    @Args('input') input: GetUserBalanceHistoryEntriesInput
  ): Promise<UserBalanceHistoryEntries> {
    const { entries, skip, take, total } =
      await this.walletsService.getUserOperationsHistory({
        userId: input.userId,
        skip: input.skip,
        take: input.take,
      });

    return new UserBalanceHistoryEntries({
      entries: entries.map(
        (entry: any) =>
          new BalanceHistoryEntryGraphQLEntity({
            amount: Number(entry.amount),
            details: entry.details,
            type: entry.type,
            date: entry.createdAt,
          })
      ),
      skip,
      take,
      total,
    });
  }

  @Query(() => UserWalletStatisticGraphqlEntity)
  @UsePermissions([PermissionsEnum.userBalanceStatistic])
  async getUserWalletStatistic(
    @UserCredentials() _credentials: IUserCredentials,
    @Args('input') input: GetByUserInput
  ): Promise<UserWalletStatisticGraphqlEntity> {
    const statistic = await this.walletsService.getUserWalletStatistic({
      userId: input.userId,
    });

    return {
      currentBalance: statistic.currentBalance,
      amountDeposit: statistic.deposits.amount,
      countDeposit: statistic.deposits.count,
      amountWithdraw: statistic.withdraws.amount,
      countWithdraw: statistic.withdraws.amount,
    };
  }
}
