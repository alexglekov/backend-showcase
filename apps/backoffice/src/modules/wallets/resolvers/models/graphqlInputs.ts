import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { PaginatedGraphQLInput, PaginatedGraphQLOutput } from '@xyro/libs/graphql';
import { BalanceHistoryEntryGraphQLEntity } from './walletGraphqlEntities.models';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class GetUserBalanceHistoryEntriesInput extends PaginatedGraphQLInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  userId: string
}

@ObjectType()
export class UserBalanceHistoryEntries extends PaginatedGraphQLOutput {
  @Field(() => [BalanceHistoryEntryGraphQLEntity])
  entries: BalanceHistoryEntryGraphQLEntity[]

  constructor(entity: UserBalanceHistoryEntries) {
    super();

    this.entries = entity.entries;
    this.total = entity.total;
    this.skip = entity.skip;
    this.take = entity.take;
  }
}

@InputType()
export class GetByUserInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  userId: string
}

@ObjectType('UserWalletStatistic')
export class UserWalletStatisticGraphqlEntity {
  @Field()
  currentBalance: number;

  @Field()
  countDeposit: number;

  @Field()
  countWithdraw: number;

  @Field()
  amountDeposit: number;

  @Field()
  amountWithdraw: number;
}