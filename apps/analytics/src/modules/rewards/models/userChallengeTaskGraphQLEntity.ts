import { Directive, Field, ObjectType } from '@nestjs/graphql';
import { UserChallengeTaskEntity } from '@xyro/contracts/analytics';
import { GraphQLEntitiesNames } from '@xyro/core';

@ObjectType(GraphQLEntitiesNames.UserChallengeTask)
@Directive('@key(fields: "id")')
export class UserChallengeTaskGraphQLEntity extends UserChallengeTaskEntity {}
