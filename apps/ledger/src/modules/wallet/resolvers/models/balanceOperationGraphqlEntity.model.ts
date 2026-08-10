import { Field, ObjectType } from '@nestjs/graphql';
import { EntryType } from '@prisma/client';
import { GraphQLEntitiesNames } from '@xyro/core';
import { LedgerEntryEntity } from '@xyro/libs/ledger';

@ObjectType(GraphQLEntitiesNames.BalanceOperation)
export class BalanceOperationGraphQLEntity {
  @Field(() => EntryType)
  type: EntryType;

  @Field()
  details: string;

  @Field()
  amount: number;

  @Field(() => Date, { nullable: true })
  date?: Date;

  constructor(entry: LedgerEntryEntity) {
    const props = entry.getProps();
    this.type = props.type;
    this.date = props.createdAt;
    this.details = props.details;
    this.amount = Number(props.amount);
  }
}
