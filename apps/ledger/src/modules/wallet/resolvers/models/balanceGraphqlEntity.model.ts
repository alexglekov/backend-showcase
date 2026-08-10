import { ObjectType, Directive } from '@nestjs/graphql';
import { Balance } from '@prisma/client';
import { BalanceEntity } from '@xyro/contracts/ledger';
import { GraphQLEntitiesNames } from '@xyro/core';
import { LedgerBalanceEntity } from '@xyro/libs/ledger';

@ObjectType(GraphQLEntitiesNames.Balance)
@Directive('@key(fields: "id")')
export class BalanceGraphQLEntity extends BalanceEntity {
  constructor(payload: LedgerBalanceEntity) {
    super(payload as Balance);
  }
}
