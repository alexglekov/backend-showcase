import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('BalanceHistoryEntry')
export class BalanceHistoryEntryGraphQLEntity {
  @Field()
  type: string;

  @Field()
  details: string;

  @Field()
  amount: number;

  @Field(() => Date, { nullable: true })
  date?: Date;

  constructor(entity: BalanceHistoryEntryGraphQLEntity) {
    this.amount = entity.amount;
    this.details = entity.details;
    this.type = entity.type;
    this.date = entity.date;
  }
}
