import { HttpService } from '@nestjs/axios';
import { DateTime } from 'luxon';
import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as ethUtil from 'ethereumjs-util';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '@xyro/libs/redis';
import { Session } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@xyro/libs/logger';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaErrorTypesEnum } from '@xyro/libs/utils';
import { DomainEventsPublisher } from '@xyro/libs/events';
import { UserCreatedDomainEvent } from '@xyro/contracts/users';

import { UsersService } from '../../users';
import { AuthService } from '../auth.base-service';
import { DBTransaction, PrismaService } from '../../../infrastructure/prisma';
import { Config } from '../../../infrastructure/config';
import { SessionsService } from '../../sessions/sessions.service';
import { ReferralsService } from '../../referrals/referrals.service';
import { Web3Service } from '../../../infrastructure/third-party/web3';

interface GetMetamaskChallengeParams {
  walletAddress: string;
}

interface VerifyMetamaskSignatureParams {
  username?: string;
  referralCode?: string;
  walletAddress: string;
  signature: string;
  agent: string;
  ip: string;
}

interface AttachWalletParams {
  userId: string;
  walletAddress: string;
  signature: string;
}

interface GetMetamaskUserParams {
  walletAddress: string;
  signature: string;
}

@Injectable()
export class AuthMetamaskService extends AuthService {
  constructor(
    private readonly logger: LoggerService,
    protected readonly configService: ConfigService<Config>,
    private readonly redisClient: RedisService,
    private readonly usersService: UsersService,
    protected readonly prismaService: PrismaService,
    protected readonly httpService: HttpService,
    protected readonly jwtService: JwtService,
    protected readonly sessionsService: SessionsService,
    protected readonly referralsService: ReferralsService,
    private readonly web3Service: Web3Service,
    protected readonly domainEventsPublisher: DomainEventsPublisher,
  ) {
    super(sessionsService);

    this.logger.setContext(AuthMetamaskService.name);
  }

  public async getChallenge({
    walletAddress,
  }: GetMetamaskChallengeParams) {
    const { challengeExpiresAt } = this.configService.get('metamask');
    const now = DateTime.now();

    const challenge = `I'm Xyro Warrior address:${walletAddress} at:${now.toISOTime()}`;

    await this.redisClient.set(
      this.getRedisKeyForChallenge(walletAddress),
      challenge,
      {
        expiresInSeconds: challengeExpiresAt,
      }
    );

    const walletHasAnyNft = await this.web3Service.checkWalletHasPlatformNFTs(walletAddress);

    return {
      challenge,
      walletHasAnyNft,
    };
    
  }

  public async attachWallet(params: AttachWalletParams): Promise<void> {
    const metamaskUser = await this.getMetamaskUser(params);

    try {
      const { userId } = params;

      await this.usersService.updateUser(userId, {
        walletAddress: metamaskUser.address,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error({
        action: `Error occured on attaching wallet`,
        payload: {
          userId: params.userId,
          walletAddress: params.walletAddress,
          errorMessage: error.message,
          errorStack: error.stack,
        }
      });

      throw new InternalServerErrorException('Something went wrong. Please try again later...');
    }
  }

  public async verifySignature(
    params: VerifyMetamaskSignatureParams
  ): Promise<Session> {
    const { agent, ip, username, referralCode } = params;

    const metamaskUser = await this.getMetamaskUser(params);

    try {
      let user = await this.usersService.findByWalletAddress(
        metamaskUser.address
      );

      if (!user) {
        if (!username) {
          throw new BadRequestException('Please sign up before sign in.');
        }

        const walletHasAnyNft = await this.web3Service.checkWalletHasPlatformNFTs(metamaskUser.address);

        if (!walletHasAnyNft && !referralCode)
          throw new BadRequestException('Minted NFTs not found and referral code not provided.');

        let referral = referralCode ?
          await this.referralsService.checkReferralAvalability({ code: referralCode })
          : undefined;

        const createdUser = await this.prismaService.$transaction(
          async (dbTransaction: DBTransaction) => {
            const user = await this.usersService.createUser(
              {
                name: username,
                walletAddress: metamaskUser.address,
              },
              dbTransaction
            );

            await this.referralsService.takeReferral(
              {
                userId: user.id,
                referrerId: referral?.userId || undefined,
              },
              dbTransaction,
            );

            return user;
          },
        );

        await this.domainEventsPublisher.publish(new UserCreatedDomainEvent(createdUser, referral));

        user = createdUser;
      }

      return this.afterLogin({
        agent,
        ip,
        userId: user.id,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Something went wrong. Please try again later.');
    }
  }

  private async getMetamaskUser(params: GetMetamaskUserParams) {
    const { walletAddress, signature } = params;

    const challenge = await this.redisClient.get<string>(
      this.getRedisKeyForChallenge(walletAddress),
      false
    );

    if (!challenge) {
      throw new BadRequestException('Incorrect challenge.');
    }

    await this.redisClient.delete(this.getRedisKeyForChallenge(walletAddress));

    const address = this.getAddressFromSignature(challenge, signature);

    if (address.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new BadRequestException('Incorrect wallet address.');
    }

    return {
      address,
    };
  }

  private getAddressFromSignature(challenge: string, signature: string) {
    const publicKey = this.getBuffer(challenge, signature);
    const addressBuffer = ethUtil.publicToAddress(publicKey);
    const address = ethUtil.bufferToHex(addressBuffer);

    return address;
  }

  private getBuffer(challenge: string, signature: string): Buffer {
    const msgHex = ethUtil.bufferToHex(Buffer.from(challenge));
    const msgBuffer = ethUtil.toBuffer(msgHex);
    const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
    const signatureParams = ethUtil.fromRpcSig(signature);

    return ethUtil.ecrecover(
      msgHash,
      signatureParams.v,
      signatureParams.r,
      signatureParams.s
    );
  }

  private getRedisKeyForChallenge(walletAddress: string) {
    return `challenge:${walletAddress}`;
  }
}
