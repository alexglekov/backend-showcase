import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { PaginatedGraphQLInput, PaginatedGraphQLOutput } from '@xyro/libs/graphql';
import { LedgerEntryEntity } from '@xyro/libs/ledger';
import { EntryType, GameTypeEnum } from '@prisma/client';

import { BalanceOperationGraphQLEntity } from './balanceOperationGraphqlEntity.model';

@InputType('GetBalanceOperationsInput')
export class GetBalanceOperationsGraphQLInput extends PaginatedGraphQLInput {
  @Field(() => EntryType, { nullable: true })
  type?: EntryType;

  @Field(() => GameTypeEnum, { nullable: true })
  gameMode?: GameTypeEnum;
}

@ObjectType('BalanceOperations')
export class BalanceOperationsGraphQLEntity extends PaginatedGraphQLOutput {
  @Field(() => [BalanceOperationGraphQLEntity])
  operations: BalanceOperationGraphQLEntity[]

  constructor(entries: LedgerEntryEntity[], take: number, skip: number, total: number) {
    super();

    this.operations = entries.map((entry) => new BalanceOperationGraphQLEntity(entry));
    this.skip = skip;
    this.take = take;
    this.total = total;
  }
}

@InputType('GetBalanceHistoryInput')
export class GetBalanceHistoryGraphQLInput {
  @Field(() => Date, { nullable: true })
  startDate: Date;

  @Field(() => Date, { nullable: true })
  endDate: Date;
}
