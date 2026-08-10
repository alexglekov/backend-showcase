import { Directive, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLEntitiesNames, PrivacyPolicies } from '@xyro/core';
import { User } from '@prisma/client';

import { PaymentOrderGraphQLEntityReference, PaymentTransactionGraphQLEntityReference } from './references';

@ObjectType(GraphQLEntitiesNames.User)
@Directive('@key(fields: "id request")')
export class UserGraphQLOrphanEntity {
  @Field()
  public readonly id: string;

  @Field(() => [String])
  public readonly request: PrivacyPolicies[];

  public readonly __typename: GraphQLEntitiesNames;

  constructor(entity: Pick<User, 'id'> & { request?: PrivacyPolicies[] }) {
    this.id = entity.id;
    this.request = entity.request || [];
    this.__typename = GraphQLEntitiesNames.User;
  }
}

@ObjectType(GraphQLEntitiesNames.PaymentOrder)
@Directive('@key(fields: "id")')
export class PaymentOrderGraphQLOrphanEntity {
  @Field()
  id: string;

  constructor(payload: PaymentOrderGraphQLOrphanEntity) {
    this.id = payload.id;
  }

  public static createReference(id: string): PaymentOrderGraphQLEntityReference {
    return {
      id,
      __typename: GraphQLEntitiesNames.PaymentOrder,
    }
  }
}

@ObjectType(GraphQLEntitiesNames.PaymentTransaction)
@Directive('@key(fields: "id")')
export class PaymentTransactionGraphQLOrphanEntity {
  @Field()
  id: string;

  constructor(payload: PaymentTransactionGraphQLOrphanEntity) {
    this.id = payload.id;
  }

  public static createReference(id: string): PaymentTransactionGraphQLEntityReference {
    return {
      id,
      __typename: GraphQLEntitiesNames.PaymentTransaction,
    }
  }
}
