import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, Param } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { extname } from 'node:path';
import { StorageService } from '@xyro/libs/storage';
import { StorageSubPathes } from '@xyro/core';
import { PrismaErrorTypesEnum, passwordToHash, resizePhoto } from '@xyro/libs/utils';
import { UploadedFile } from '@xyro/libs/graphql';
import { LoggerService } from '@xyro/libs/logger';
import { DomainEventsPublisher } from '@xyro/libs/events';
import { UserUpdatedDomainEvent, getUserCacheKey } from '@xyro/contracts/users';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { RedisService } from '@xyro/libs/redis';

import { UsersRepository } from './users.repository';
import { NotificationPolicyService } from '../../notifications-policy/notification-policy.service';
import { PrivacyService } from '../../privacy/privacy.service';
import { DBTransaction } from '../../../infrastructure/prisma';

interface FindByParams {
  id?: string;
}

interface FindManyByIdParams {
  ids: string[];
}

export interface UpdateUserParams {
  name?: string;
  email?: string;
  password?: string;
  bio?: string;
  discordId?: string;
  avatarKeys?: string[];
  discordRoles?: string[];
  twitterId?: string;
  twitterAccessToken?: string;
  twitterRefreshToken?: string;
  walletAddress?: string;
  passwordRecoveryToken?: string | null;
}

const USER_CACHE_KEY_TTL = 600;

@Injectable()
export class UsersService {
  private readonly avatarSizes = [
    {
      name: 'min',
      width: 64,
      height: 64,
    },
    {
      name: 'middle',
      width: 128,
      height: 128,
    },
    {
      name: 'high',
      width: 512,
      height: 512,
    },
  ];

  constructor(
    private readonly redisService: RedisService,
    private readonly logger: LoggerService,
    private readonly storageService: StorageService,
    private readonly usersRepository: UsersRepository,
    private readonly privacyService: PrivacyService,
    private readonly notificationPolicyService: NotificationPolicyService,
    private readonly domainEventsPublisher: DomainEventsPublisher,
  ) {
    this.logger.setContext(UsersService.name);
  }

  public async createUserUpdatedEvents(userId: string) {
    const foundUser = await this.usersRepository.findOneBy({
      walletAddress: '0xa1E10d8822CCA44f6FD4Ee60Aa586eFee6AeD6c0',
    });

    if (!foundUser || foundUser.id !== userId) {
      throw new ForbiddenException();
    }

    const take = 100;
    let skip = 0;
    let users = [];

    do {
      users = await this.usersRepository.findPaginated({ walletAddress: { not: null } }, take, skip);
      skip += users.length;

      for (const user of users) {
        await this.domainEventsPublisher.publish(new UserUpdatedDomainEvent(user));
      }

    } while(users.length !== 0);
  }

  public async findByEmail(email: string) {
    return this.usersRepository.findOneBy({ email });
  }

  public async findByPasswordRecoveryToken(token: string) {
    return this.usersRepository.findOneBy({ passwordRecoveryToken: token, });
  }

  public async findBy(params: FindByParams) {
    return this.usersRepository.findOneBy(params);
  }

  public async findOneByOrThrow(params: FindByParams) {
    return this.usersRepository.findOneByOrThrow(params);
  }

  public async findOneByOrThrowWithCache(params: FindByParams) {
    const cachedUser = await this.redisService.get<User>(getUserCacheKey(params.id!));

    if (cachedUser) return cachedUser;

    const foundUser = await this.usersRepository.findOneByOrThrow(params);

    await this.redisService.set(
      getUserCacheKey(foundUser.id),
      foundUser,
      { expiresInSeconds: USER_CACHE_KEY_TTL }
    );

    return foundUser;
  }

  public async findById(userId: string) {
    return this.usersRepository.findOneBy({ id: userId });
  }

  public async findByTwitterId(twitterId: string) {
    return this.usersRepository.findOneBy({ twitterId });
  }

  public async updateOrCreate(
    where: Prisma.UserUpsertArgs['where'],
    create: Prisma.UserUpsertArgs['create'],
    update: Prisma.UserUpsertArgs['update'],
  ) {
    return this.usersRepository.updateOrCreate({
      where,
      create: {
        avatarKeys: [],
        discordRoles: [],
        ...create,
      },
      update,
    });
  }

  public async findByWalletAddress(walletAddress: string) {
    return this.usersRepository.findOneBy({ walletAddress });
  }

  public async findByDiscordId(discordId: string) {
    return this.usersRepository.findOneBy({ discordId });
  }

  public async createUser(input: Prisma.UserCreateInput, dbTransaction: DBTransaction) {
    try {
      const user = await this.usersRepository.create(
        {
          avatarKeys: [],
          discordRoles: [],
          ...input,
        },
        dbTransaction,
      );

      await Promise.all([
        this.privacyService.createPolicy(user.id, dbTransaction),
        this.notificationPolicyService.createNotificationPolicy(user.id, dbTransaction),
      ]);

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw this.handleDatabaseException(error);
      }
      throw error;
    }
  }

  async findAndUpdateByTwitter(twitterId: string, input: Prisma.UserUpdateInput) {
    try {
      const updatedUser = await this.usersRepository.updateBy({ twitterId }, input);

      return updatedUser;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw this.handleDatabaseException(error);
      }

      throw error;
    }
  }

  public async updateUser(userId: string, params: UpdateUserParams) {
    try {

      if (params.name) {
        const isNameAllowed = await this.checkName(params.name, userId);
        
        if (!isNameAllowed) {
          throw new BadRequestException(`Name <${params.name}> is not allowed`);
        }
      }
      if (params.email && !params.password) {
        throw new BadRequestException(`Email can't be changed`);
      }
      const user = await this.findById(userId);
      
      if (!user) {
        throw new BadRequestException('User not found');
      }
      
      if (params.email && params.password) {
        if (user.email && user.email !== params.email) {
          throw new BadRequestException(`Email can't be changed`);
        }
        
        if (passwordToHash(params.password) === user.passwordHash) {
          throw new BadRequestException(`New and old passwords match`);
        }
      }

      const updatedUser = await this.usersRepository.update(userId, {
        name: params.name || undefined,
        avatarKeys: params.avatarKeys || undefined,
        passwordHash: params.password
        ? passwordToHash(params.password)
        : undefined,
        email: params.email || undefined,
        bio: params.bio,
        discordId: params.discordId,
        discordRoles: params.discordRoles,
        twitterId: params.twitterId,
        walletAddress: params.walletAddress,
        passwordRecoveryToken: params.passwordRecoveryToken,
      });
      
      await Promise.allSettled([
        this.domainEventsPublisher.publish(new UserUpdatedDomainEvent(updatedUser)),
        this.redisService.delete(getUserCacheKey(updatedUser.id)),
      ]);
      
      return updatedUser;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw this.handleDatabaseException(error);
      }

      throw error;
    }
  }


  async updateUserAvatar(userId: string, avatar: Omit<UploadedFile, 'encoding' | 'fieldName' | 'capacitor'>): Promise<User> {
    const filename = `${userId}-${Date.now()}${extname(avatar.filename)}`;

    let avatarKeys: string[];
    try {
      avatarKeys = await Promise.all(
        this.avatarSizes.map((size) =>
          resizePhoto(avatar.buffer, size.width, size.height)
          .then((buffer) =>
            this.storageService.putFileViaBuffer({
              fileBuffer: buffer,
              mimetype: avatar.mimetype,
              name: `${size.name}-${filename}`,
              subPath: StorageSubPathes.accountProfiles,
            }),
          )
          .then(({ key }) => key),
        ),
      );
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Internal error, please try again later...')
    }

    const updatedUser = await this.updateUser(userId, { avatarKeys });

    return updatedUser;
  }

  async deleteUser(userId: string, reason: string): Promise<void> {
    // todo: delete user account
  }

  async deleteUserAvatar(userId: string): Promise<User> {
    const user = await this.usersRepository.findOneByOrThrow({ id: userId });

    const avatarKeys = user.avatarKeys as unknown as string[];

    await Promise.all(
      avatarKeys.map((avatarKey) =>
        this.storageService.deleteFile({ key: avatarKey })
      )
    );

    const updatedUser = await this.updateUser(user.id, { avatarKeys: [] });

    return updatedUser;
  }

  public async findChatMembers({
    name,
    skip,
    take,
  }: {
    name: string;
    skip: number;
    take: number;
  }): Promise<User[]> {
    const users = await this.usersRepository.findPaginated(
      {
        name: {
          contains: name,
        },
      },
      take,
      skip
    );

    return users;
  }

  public async find1vs1Opponents({
    name,
    userId,
    skip,
    take,
  }: {
    userId?: string;
    name: string;
    skip: number;
    take: number;
  }): Promise<User[]> {
    const users = await this.usersRepository.findPaginated(
      {
        name: {
          contains: name,
          mode: 'insensitive',
        },
        id: userId ? { not: userId } : undefined,
      },
      take,
      skip
    );

    return users;
  }

  public async getUrisFromKeys(avatarKeys: string[]): Promise<string[]> {
    if (!avatarKeys) return [];

    return Promise.all(
      avatarKeys.map((avatarKey) =>
        this.storageService
          .getFileUri({ key: avatarKey })
          .then(({ uri }) => uri)
      )
    );
  }

  public async findManyByWithCache(params: FindManyByIdParams) {
    const { ids } = params;

    const usersCaches = await this.redisService.getBatch<User>(ids.map((id) => getUserCacheKey(id)));

    const notCachedUsers = ids.filter((_, index) => !usersCaches[index]);

    if (notCachedUsers.length === 0) return usersCaches;

    const users = await this.usersRepository.findManyBy({
      id: {
        in: notCachedUsers,
      }
    });

    await Promise.allSettled(
      users.map((user) => this.redisService.set(getUserCacheKey(user.id), user, { expiresInSeconds: USER_CACHE_KEY_TTL }))
    )

    return usersCaches.concat(users);
  }

  public async checkName(name: string, userId?: string): Promise<boolean> {
    const foundUser = await this.usersRepository.findOneBy({
      name,
    });

    if (!foundUser) return true;

    if (userId) {
      return foundUser.id === userId;
    }

    return false;
  }

  private handleDatabaseException(error: PrismaClientKnownRequestError) {
    if (error.code === PrismaErrorTypesEnum.UniqueConstraintFailed) {
      const fieldName = (error.meta?.target as any)?.[0] || undefined;
      if (fieldName && fieldName === 'name')
        return new BadRequestException('User with this name already exists');
      if (fieldName && fieldName === 'email')
        return new BadRequestException('User with this email already exists');
      if (fieldName && fieldName === 'walletAddress')
        return new BadRequestException('User with this wallet already exists');
      if (fieldName && fieldName === 'discordId')
        return new BadRequestException('User with this discord account already exists');
      if (fieldName && fieldName === 'twitterId')
        return new BadRequestException('User with this twitter account already exists');
    }

    if (error.code === PrismaErrorTypesEnum.RecordToUpdateNotFound) {
      return new BadRequestException('User not found.');
    }

    return error;
  }
}
