import { Injectable, OnModuleInit } from '@nestjs/common';
import { BackofficePermission } from '@prisma/client';

import { PrismaService } from '../../../../infrastructure/prisma';
import { PermissionsEnum } from '../core/permissions.enum';
import { ADMIN_GROUP_NAME } from '../../groups';

@Injectable()
export class PermissionsInitService implements OnModuleInit {
  constructor(private readonly prismaService: PrismaService) {}

  async onModuleInit() {
    const permissions = await this.createPermissionsIfNotExists();

    await this.assignPermissionsToNativeAdmins(permissions);
  }

  async createPermissionsIfNotExists() {
    const permissions = Object.values(PermissionsEnum);

    const foundOrCreatedPermissions: BackofficePermission[] = [];

    for (const permission of permissions) {
      const foundPermission = await this.prismaService.backofficePermission.findFirst({
        where: {
          systemName: permission,
        }
      });

      if (!foundPermission) {
        const createdPermission = await this.prismaService.backofficePermission.create({
          data: {
            systemName: permission,
            name: permission,
          },
        });

        foundOrCreatedPermissions.push(createdPermission);
      } else {
        foundOrCreatedPermissions.push(foundPermission);
      }
    }

    return foundOrCreatedPermissions;
  }

  async assignPermissionsToNativeAdmins(permissions: BackofficePermission[]) {
    const adminsGroup = await this.prismaService.backofficeGroup.findFirstOrThrow({
      where: {
        name: ADMIN_GROUP_NAME,
      },
      select: {
        id: true,
      }
    });

    const upsertPromises: Promise<unknown>[] = [];
    for (const permission of permissions) {
      upsertPromises.push(
        this.prismaService.backofficeGroupsPermissions.upsert({
          where: {
            groupId_permissionId: {
              permissionId: permission.id,
              groupId: adminsGroup.id,
            },
          },
          create: {
            permissionId: permission.id,
            groupId: adminsGroup.id,
          },
          update: {},
        })
      );
    }
    await Promise.all(upsertPromises);
  }
}