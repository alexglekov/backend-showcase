import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials, Void } from '@xyro/libs/graphql';

import { GroupsService } from '../services/groups.service';
import { BackofficeGroupGraphQLEntity } from '../models/groupGraphqlEntity.model';
import { AddGroupInput, AddUserToGroupInput, GetAllGroupsInput, Groups, RemoveGroupInput, RemoveUserFromGroupInput, UpdateGroupInput } from '../models/groupsGraphql.models';
import { BackofficeGroupMemberGraphQLEntity } from '../models/groupMemberGraphqlEntity.model';
import { PermissionsEnum, UsePermissions } from '../../permissions';

@Resolver()
export class GroupsResolver {
  constructor(private readonly groupsService: GroupsService) {}

  @Query(() => Groups)
  @UsePermissions([
    PermissionsEnum.groupsRead,
  ])
  async getAllGroups(
    @UserCredentials() _credentials: IUserCredentials,
    @Args('data') payload: GetAllGroupsInput,
  ): Promise<Groups> {
    const { groups, skip, take, total } = await this.groupsService.getAll({
      skip: payload.skip,
      take: payload.take
    });

    return new Groups({
      groups: groups.map((group) => new BackofficeGroupGraphQLEntity(group)),
      skip,
      take,
      total,
    });
  }

  @Mutation(() => BackofficeGroupGraphQLEntity)
  @UsePermissions([
    PermissionsEnum.groupsCreate,
  ])
  async addGroup(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') payload: AddGroupInput,
  ): Promise<BackofficeGroupGraphQLEntity> {
    const { userId } = credentials;

    const createdGroup = await this.groupsService.addGroup({
      blameId: userId,
      name: payload.name,
    });

    return new BackofficeGroupGraphQLEntity(createdGroup);
  }

  @Mutation(() => BackofficeGroupGraphQLEntity)
  @UsePermissions([
    PermissionsEnum.groupsUpdate,
  ])
  async updateGroup(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') payload: UpdateGroupInput,
  ): Promise<BackofficeGroupGraphQLEntity> {
    const { userId } = credentials;

    const updatedGroup = await this.groupsService.updateGroup({
      blameId: userId,
      name: payload.name,
      id: payload.id,
    });

    return new BackofficeGroupGraphQLEntity(updatedGroup);
  }

  @Mutation(() => Void)
  @UsePermissions([
    PermissionsEnum.groupsDelete,
  ])
  async removeGroup(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') payload: RemoveGroupInput,
  ): Promise<Void> {
    const { userId } = credentials;

    await this.groupsService.removeGroup({
      blameId: userId,
      id: payload.id,
    });

    return new Void();
  }

  @Mutation(() => Void)
  @UsePermissions([
    PermissionsEnum.groupsRemoveMember,
  ])
  async removeUserFromGroup(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') payload: RemoveUserFromGroupInput,
  ): Promise<Void> {
    const { userId } = credentials;

    await this.groupsService.removeUserFromGroup({
      blameId: userId,
      userId: payload.userId,
      groupId: payload.groupId,
    });

    return new Void();
  }
  
  @Mutation(() => BackofficeGroupMemberGraphQLEntity)
  @UsePermissions([
    PermissionsEnum.groupsAddMember,
  ])
  async addUserToGroup(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') payload: AddUserToGroupInput,
  ): Promise<BackofficeGroupMemberGraphQLEntity> {
    const { userId } = credentials;

    const member = await this.groupsService.joinUserToGroup({
      blameId: userId,
      userId: payload.userId,
      groupId: payload.groupId,
    });

    return new BackofficeGroupMemberGraphQLEntity(member);
  }
}
