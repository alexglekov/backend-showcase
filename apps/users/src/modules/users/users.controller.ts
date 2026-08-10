import { BadRequestException, Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import {
  GetUserByAddressPayload,
  GetUserByIdPayload,
  User,
} from '@xyro/contracts/users';

import { UsersService } from './services/users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @GrpcMethod('UsersService', 'GetUserById')
  async getUserById(data: GetUserByIdPayload): Promise<User> {
    try {
      const { userId } = data;
      const foundUser = await this.usersService.findById(userId);

      if (!foundUser) {
        throw new BadRequestException('User not found');
      }

      const avatarKeys = foundUser.avatarKeys as string[];
      const avatarUris = await this.usersService.getUrisFromKeys(avatarKeys);

      return {
        avatarKeys,
        email: foundUser.email || undefined,
        id: foundUser.id,
        name: foundUser.name,
        avatarUris,
        isInfluencer: foundUser.isInfluencer,
        discordId: foundUser.discordId || undefined,
        twitterId: foundUser.twitterId || undefined,
        walletAddress: foundUser.walletAddress || undefined,
        bio: foundUser.bio,
      };
    } catch (e) {
      throw new RpcException(e);
    }
  }

  @GrpcMethod('UsersService', 'GetUserByAddress')
  async getUserByAddress(data: GetUserByAddressPayload): Promise<User> {
    try {
      const { address } = data;
      const foundUser = await this.usersService.findByWalletAddress(address);

      if (!foundUser) {
        throw new BadRequestException('User not found');
      }

      const avatarKeys = foundUser.avatarKeys as string[];
      const avatarUris = await this.usersService.getUrisFromKeys(avatarKeys);

      return {
        avatarKeys,
        email: foundUser.email || undefined,
        id: foundUser.id,
        name: foundUser.name,
        avatarUris,
        isInfluencer: foundUser.isInfluencer,
        discordId: foundUser.discordId || undefined,
        twitterId: foundUser.twitterId || undefined,
        walletAddress: foundUser.walletAddress || undefined,
        bio: foundUser.bio,
      };
    } catch (e) {
      throw new RpcException(e);
    }
  }
}
