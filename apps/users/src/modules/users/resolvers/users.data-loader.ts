import { Injectable } from '@nestjs/common';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';
import DataLoader from 'dataloader';

import { UsersService } from '../services/users.service';
import { UserGraphQLEntity } from './types/userGraphQLEntity.type';

@Injectable()
export class UsersDataLoader {
  private readonly dataLoader: DataLoader<UserGraphQLOrphanEntity, UserGraphQLEntity | null>;

  constructor(
    private readonly usersService: UsersService,
  ) {
    this.dataLoader = new DataLoader(
      async (references: UserGraphQLOrphanEntity[]) => {
        const resolvedUsers = await this.usersService.findManyByWithCache({
          ids: references.map((reference) => reference.id)
        });

        const sortedInIdsOrder = references.map((ref) => {
          const resolvedUser = resolvedUsers.find(
            (user) => user?.id === ref.id,
          );

          return resolvedUser ? new UserGraphQLEntity(resolvedUser) : null;
        });

        return sortedInIdsOrder;
      },
    );
  }

  async getUserByReference(reference: UserGraphQLOrphanEntity): Promise<UserGraphQLEntity | null> {
    return this.dataLoader.load(reference);
  }
}
