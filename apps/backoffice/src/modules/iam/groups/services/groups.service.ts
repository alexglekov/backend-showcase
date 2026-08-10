import { BadRequestException, Injectable } from '@nestjs/common';
import { BackofficeGroup } from '@prisma/client';

import { PrismaService } from '../../../../infrastructure/prisma';

type AddGroupParams = {
  blameId: string;
  name: string;
}

type UpdateGroupParams = {
  blameId: string;
  name: string;
  id: string;
}

type RemoveGroupParams = {
  blameId: string;
  id: string;
}

type GetAllParams = {
  skip: number;
  take: number;
}

type RemoveUserFromGroupParams = {
  userId: string;
  blameId: string;
  groupId: string;
}

type JoinUserToGroupParams = {
  userId: string;
  blameId: string;
  groupId: string;
}

@Injectable()
export class GroupsService {
  constructor(private readonly prismaService: PrismaService) {}

  async joinUserToGroup(params: JoinUserToGroupParams) {
    const foundMember = await this.prismaService.usersOnGroups.findFirst({
      where: {
        groupId: params.groupId,
        userId: params.userId,
      }
    });

    if (foundMember) throw new BadRequestException('User already exists in this group');

    const createdMember = await this.prismaService.usersOnGroups.upsert({
      where: {
        groupId_userId: {
          groupId: params.groupId,
          userId: params.userId,
        }
      },
      update: {
        blameId: params.blameId,
        deleted: false,
      },
      create: {
        blameId: params.blameId,
        groupId: params.groupId,
        userId: params.userId,
      },
    });

    return createdMember;
  }

  async removeUserFromGroup(params: RemoveUserFromGroupParams) {
    const foundMember = await this.prismaService.usersOnGroups.findFirst({
      where: {
        groupId: params.groupId,
        userId: params.userId,
      }
    });

    if (!foundMember) throw new BadRequestException('Member not found in this group');

    const updatedMember = await this.prismaService.usersOnGroups.update({
      where: {
        id: foundMember.id,
      },
      data: {
        deleted: true,
        blameId: params.blameId,
        deletedAt: new Date(),
      },
    });

    return updatedMember;
  }

  async getAll(params: GetAllParams) {
    const groups = await this.prismaService.backofficeGroup.findMany({
      skip: params.skip,
      take: params.take,
    });

    const total = await this.prismaService.backofficeGroup.count();

    return {
      groups,
      skip: params.skip,
      take: params.take,
      total,
    }
  }

  async byName(name: string) {
    return this.prismaService.backofficeGroup.findFirst({
      where: {
        name
      }
    });
  }

  async byId(id: string) {
    return this.prismaService.backofficeGroup.findFirst({
      where: {
        id
      }
    });
  }

  async addGroup(params: AddGroupParams): Promise<BackofficeGroup> {
    const foundGroup = await this.prismaService.backofficeGroup.findFirst({
      where: {
        name: params.name,
      }
    })
    
    if (foundGroup) throw new BadRequestException('Group with this name already exists');

    const createdGroup = await this.prismaService.backofficeGroup.create({
      data: {
        name: params.name,
        blameId: params.blameId,
      }
    });

    return createdGroup;
  }

  async updateGroup(params: UpdateGroupParams): Promise<BackofficeGroup> {
    const foundGroup = await this.prismaService.backofficeGroup.findFirst({
      where: {
        name: params.name,
      }
    })
    
    if (foundGroup && foundGroup.id !== params.id) throw new BadRequestException('Group with this name already exists');

    const updatedGroup = await this.prismaService.backofficeGroup.update({
      data: {
        name: params.name,
        blameId: params.blameId,
      },
      where: {
        id: params.id
      }
    });

    return updatedGroup;
  }

  async removeGroup(params: RemoveGroupParams): Promise<void> {
    await this.prismaService.backofficeGroup.delete({
      where: {
        id: params.id
      }
    });
  }
}