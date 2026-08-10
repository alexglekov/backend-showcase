import { BadRequestException, Injectable } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';

import { DBTransaction, PrismaService } from '../../../infrastructure/prisma';

@Injectable()
export class UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async inTransaction<T>(
    callback: (transaction: DBTransaction) => T,
  ) {
    return this.prismaService.$transaction(
      async (transaction: DBTransaction) => callback(transaction),
    );
  }

  public async updateOrCreate(
    upsertParams: Prisma.UserUpsertArgs,
    dbTransaction?: DBTransaction,
  ): Promise<User | null> {
    const resource = this.resolveResource(dbTransaction);

    return resource.user.upsert(upsertParams);
  }

  public async findOneBy(
    where: Prisma.UserWhereInput,
    dbTransaction?: DBTransaction,
  ): Promise<User | null> {
    const resource = this.resolveResource(dbTransaction);

    return resource.user.findFirst({
      where,
    });
  }

  public async findOneByOrThrow(
    where: Prisma.UserWhereInput,
    dbTransaction?: DBTransaction,
  ): Promise<User> {
    const user = await this.findOneBy(where, dbTransaction);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  public async findManyBy(
    where: Prisma.UserWhereInput,
    dbTransaction?: DBTransaction,
  ): Promise<User[]> {
    const resource = this.resolveResource(dbTransaction);

    const users = await resource.user.findMany({ where });

    return users;
  }

  public async find(
    where: Prisma.UserWhereInput,
    dbTransaction?: DBTransaction,
  ): Promise<User[]> {
    const resource = this.resolveResource(dbTransaction);

    return resource.user.findMany({
      where,
    });
  }

  public async findPaginated(
    where: Prisma.UserWhereInput,
    take: number,
    skip: number,
    dbTransaction?: DBTransaction,
  ): Promise<User[]> {
    const resource = this.resolveResource(dbTransaction);

    return resource.user.findMany({
      where,
      take,
      skip,
    });
  }

  public async update(
    userId: User['id'],
    payload: Prisma.UserUpdateInput,
    dbTransaction?: DBTransaction,
  ): Promise<User> {
    const resource = this.resolveResource(dbTransaction);

    return resource.user.update({
      where: {
        id: userId,
      },
      data: payload,
    });
  }

  public async updateBy(
    where: Prisma.UserWhereUniqueInput,
    payload: Prisma.UserUpdateInput,
    dbTransaction?: DBTransaction,
  ): Promise<User> {
    const resource = this.resolveResource(dbTransaction);

    return resource.user.update({
      where,
      data: payload,
    });
  }

  public async create(
    payload: Prisma.UserCreateInput,
    dbTransaction?: DBTransaction,
  ): Promise<User> {
    const resource = this.resolveResource(dbTransaction);

    return resource.user.create({
      data: payload,
    });
  }

  private resolveResource(dbTransaction?: DBTransaction) {
    return dbTransaction ?? this.prismaService;
  }
}
