import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Config } from '../../../../infrastructure/config';
import { PrismaService } from '../../../../infrastructure/prisma';

export const ADMIN_GROUP_NAME = 'Admins';

@Injectable()
export class NativeGroupsInitService implements OnModuleInit {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService<Config>
  ) {}

  async onModuleInit() {
    await this.createAdminsGroupIfNotExists();
  }

  async createAdminsGroupIfNotExists() {
    let adminsGroup = await this.prismaService.backofficeGroup.findFirst({
      where: {
        name: ADMIN_GROUP_NAME,
      }
    });

    if (!adminsGroup) {
      adminsGroup = await this.prismaService.backofficeGroup.create({
        data: {
          name: ADMIN_GROUP_NAME,
        }
      });
    }

    const { testAccounts } = this.configService.get('app');

    const foundAdmins = await this.prismaService.backofficeUser.findMany({
      where: {
        email: {
          in: testAccounts.admins.map((admin) => admin.email),
        }
      },
      select: {
        id: true,
      }
    });

    const upsertPromises: Promise<unknown>[] = [];
    for (const admin of foundAdmins) {
      upsertPromises.push(
        this.prismaService.usersOnGroups.upsert({
          where: {
            groupId_userId: {
              userId: admin.id,
              groupId: adminsGroup.id,
            },
          },
          create: {
            userId: admin.id,
            groupId: adminsGroup.id,
          },
          update: {},
        })
      );
    }
    await Promise.all(upsertPromises);
  }
}