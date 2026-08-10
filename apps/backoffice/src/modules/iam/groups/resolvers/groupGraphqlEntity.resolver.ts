import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { BackofficeGroupGraphQLEntity } from '../models/groupGraphqlEntity.model';
import { BackofficeUsersService } from '../../users';
import { BackofficeUserGraphQLEntity } from '../../users/models/userGraphqlEntity.model';

@Resolver(() => BackofficeGroupGraphQLEntity)
export class BackofficeGroupGraphQLEntityResolver {
  constructor(private readonly backofficeUsersService: BackofficeUsersService) {}

  @ResolveField(() => BackofficeUserGraphQLEntity, { nullable: true, name: 'blame' })
  async blame(@Parent() group: BackofficeGroupGraphQLEntity) {
    if (group.blameId) {
      const user = await this.backofficeUsersService.findById(group.blameId);
    
      if (user) return new BackofficeUserGraphQLEntity(user);
    }

    return null;
  }
}
