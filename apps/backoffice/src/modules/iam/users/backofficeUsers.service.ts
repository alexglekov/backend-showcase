import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma';

type CreateUserParams = {
  name: string;
  surname: string;
  passwordHash: string;
  email: string;
}

@Injectable()
export class BackofficeUsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findByEmail(email: string) {
    return this.prismaService.backofficeUser.findFirst({
      where: {
        email,
      }
    })
  }

  async findByIdOrThrow(id: string) {
    return this.prismaService.backofficeUser.findFirstOrThrow({
      where: {
        id,
      }
    })
  }

  async findById(id: string) {
    return this.prismaService.backofficeUser.findFirst({
      where: {
        id,
      }
    })
  }

  async findByEmailOrThrow(email: string) {
    return this.prismaService.backofficeUser.findFirstOrThrow({
      where: {
        email,
      }
    })
  }

  async createUser(params: CreateUserParams) {
    return this.prismaService.backofficeUser.create({
      data: {
        email: params.email,
        name: params.name,
        surname: params.surname,
        passwordHash: params.passwordHash
      }
    })
  }
}