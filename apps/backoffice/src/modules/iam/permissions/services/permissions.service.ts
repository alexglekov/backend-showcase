import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/prisma';

interface GetAllParams {
  take: number;
  skip: number;
}

interface GetUserPermissionsParams {
  userId: string
}

interface GetGroupPermissionsParams {
  groupId: string;
  take: number;
  skip: number;
}

interface CheckPermissionParams {
  userId: string;
  permissions: string[];
}


type RemovePermissionFromGroupParams = {
  permissionId: string;
  blameId: string;
  groupId: string;
}

type AddPermissionToGroupParams = {
  permissionId: string;
  blameId: string;
  groupId: string;
}

@Injectable()
export class PermissionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAll(params: GetAllParams) {
    const permissions = await this.prismaService.backofficePermission.findMany({
      skip: params.skip,
      take: params.take,
    });

    const total = await this.prismaService.backofficePermission.count();

    return {
      permissions,
      total,
      take: params.take,
      skip: params.skip,
    }
  }

  async getUserPermissions(params: GetUserPermissionsParams) {
    const groups = await this.prismaService.usersOnGroups.findMany({
      where: {
        userId: params.userId,
      },
      select: {
        groupId: true,
      }
    })

    const foundPermissions = await this.prismaService.backofficeGroupsPermissions.findMany({
      where: {
        groupId: {
          in: groups.map((group) => group.groupId)
        },
      },
      distinct: 'permissionId',
    });

    return foundPermissions;
  }

  byId(id: string) {
    return this.prismaService.backofficePermission.findFirst({
      where: {
        id
      }
    });
  }

  async getGroupPermissions(params: GetGroupPermissionsParams) {
    const permissions = await this.prismaService.backofficeGroupsPermissions.findMany({
      where: {
        groupId: params.groupId,
      },
      skip: params.skip,
      take: params.take,
    });

    const total = await this.prismaService.backofficeGroupsPermissions.count({
      where: {
        groupId: params.groupId,
      },
    });

    return {
      permissions,
      total,
      take: params.take,
      skip: params.skip,
    }
  }


  async checkPermission(params: CheckPermissionParams): Promise<boolean> {
    const groups = await this.prismaService.usersOnGroups.findMany({
      where: {
        userId: params.userId,
      },
      select: {
        groupId: true,
      }
    })

    const countFound = await this.prismaService.backofficeGroupsPermissions.findMany({
      where: {
        groupId: {
          in: groups.map((group) => group.groupId)
        },
        permission: {
          systemName: {
            in: params.permissions,
          }
        },
      },
      distinct: 'permissionId',
      select: {
        id: true,
      }
    });

    return countFound.length === params.permissions.length;
  }

  async addPermissionToGroup(params: AddPermissionToGroupParams) {
    const foundGroupPermission = await this.prismaService.backofficeGroupsPermissions.findFirst({
      where: {
        groupId: params.groupId,
        permissionId: params.permissionId,
      }
    });

    if (foundGroupPermission) throw new BadRequestException('Permission already exists for this group');

    const createdGroupPermission = await this.prismaService.backofficeGroupsPermissions.upsert({
      where: {
        groupId_permissionId: {
          groupId: params.groupId,
          permissionId: params.permissionId,
        }
      },
      update: {
        blameId: params.blameId,
        deleted: false,
      },
      create: {
        blameId: params.blameId,
        groupId: params.groupId,
        permissionId: params.permissionId,
      },
    });

    return createdGroupPermission;
  }

  async removePermissionFromGroup(params: RemovePermissionFromGroupParams) {
    const foundGroupPermission = await this.prismaService.backofficeGroupsPermissions.findFirst({
      where: {
        groupId: params.groupId,
        permissionId: params.permissionId,
      }
    });

    if (!foundGroupPermission) throw new BadRequestException('Permission not found for this group');

    const updatedGroupPermission = await this.prismaService.backofficeGroupsPermissions.update({
      where: {
        id: foundGroupPermission.id,
      },
      data: {
        deleted: true,
        blameId: params.blameId,
        deletedAt: new Date(),
      },
    });

    return updatedGroupPermission;
  }
}
