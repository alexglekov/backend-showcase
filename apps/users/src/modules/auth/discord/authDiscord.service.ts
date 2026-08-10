import { HttpService } from '@nestjs/axios';
import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { URL } from 'node:url';
import { lastValueFrom } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '@xyro/libs/redis';
import { ConfigService } from '@nestjs/config';
import { Session } from '@prisma/client';
import { LoggerService } from '@xyro/libs/logger';
import { DomainEventsPublisher } from '@xyro/libs/events';
import { UserCreatedDomainEvent } from '@xyro/contracts/users';
import { MimeType, UploadedFile } from '@xyro/libs/graphql';

import { UsersService } from '../../users';
import { AuthService } from '../auth.base-service';
import { Config } from '../../../infrastructure/config';
import { SessionsService } from '../../sessions/sessions.service';
import { ReferralsService } from '../../referrals/referrals.service';
import { DBTransaction, PrismaService } from '../../../infrastructure/prisma';

const DISCORD_URI = 'https://discord.com';
const CDN_DISCORD_URI = 'https://cdn.discordapp.com';

interface VerifyDiscordParams {
  username?: string;
  state: string;
  code: string;
  redirectUri: string;
  agent: string;
  referralCode?: string;
  ip: string;
}

interface AttachDiscordParams {
  userId: string;
  state: string;
  code: string;
  redirectUri: string;
}

interface GetUserDiscordParams {
  state: string;
  code: string;
  redirectUri: string;
}

interface GetUserDiscordRolesParams {
  discrodId: string;
}

interface GetDiscordAuthUriParams {
  redirectUri: string;
}

interface DiscordUser {
  discordId: string;
  username: string;
  avatar: string | null;
}

@Injectable()
export class AuthDiscordService extends AuthService {
  constructor(
    private readonly logger: LoggerService,
    protected readonly configService: ConfigService<Config>,
    private readonly redisClient: RedisService,
    private readonly usersService: UsersService,
    private readonly prismaService: PrismaService,
    protected readonly httpService: HttpService,
    protected readonly jwtService: JwtService,
    protected readonly sessionsService: SessionsService,
    protected readonly referralsService: ReferralsService,
    protected readonly domainEventsPublisher: DomainEventsPublisher,
  ) {
    super(sessionsService);

    this.logger.setContext(AuthDiscordService.name);
  }

  public async getDiscordAuthUri(params: GetDiscordAuthUriParams): Promise<string> {
    const { redirectUri } = params;
    const { tokenExpiresAt } = this.configService.get('discord');

    const state = crypto.randomBytes(8).toString('hex');

    await this.redisClient.set(
      this.getRedisKeyForToken(state),
      state,
      {
        expiresInSeconds: tokenExpiresAt,
      }
    );

    return this.generateDiscordAuthUri(state, redirectUri);
  }

  public async attachDiscord(params: AttachDiscordParams): Promise<void> {
    const discordUser = await this.getDiscordUser(params);

    try {
      const { userId } = params;

      const userDiscordRolesIds = await this.getDiscrodUserRolesIds({ discrodId: discordUser.discordId });

      await this.usersService.updateUser(userId, {
        discordId: discordUser.discordId,
        discordRoles: userDiscordRolesIds,
      });

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error({
        action: `Error occured attaching discord account`,
        payload: {
          userId: params.userId,
          errorMessage: error.message,
          errorStack: error.stack,
        }
      });

      throw new InternalServerErrorException('Something went wrong. Please try again later...');
    }
  }

  private async tryLoadDiscordAvatar(discordUser: DiscordUser): Promise<Omit<UploadedFile, 'fieldName' | 'encoding' | 'capacitor'> | null> {
    try {
      if (!discordUser.avatar) return null;

      const filename = `${discordUser.avatar}.png`;

      const { data: avatarBuffer } = await lastValueFrom(
        this.httpService.get(`${CDN_DISCORD_URI}/avatars/${discordUser.discordId}/${filename}`, {
          responseType: 'arraybuffer',
        })
      );

      return {
        filename,
        buffer: avatarBuffer,
        mimetype: MimeType.png,
      };
    } catch (error: any) {
      return null;
    }
  }

  public async verifyDiscord(params: VerifyDiscordParams): Promise<Session> {
    const { agent, ip, username, referralCode } = params;

    const discordUser = await this.getDiscordUser(params);

    try {
      let user = await this.usersService.findByDiscordId(discordUser.discordId);

      if (!user) {
        if (!referralCode) {
          throw new BadRequestException('Referral code is not provided.');
        }

        if (!username) {
          throw new BadRequestException('Please sign up before sign in.');
        }

        const referral = await this.referralsService.checkReferralAvalability({
          code: referralCode,
        });

        const userDiscordRolesIds = await this.getDiscrodUserRolesIds({ discrodId: discordUser.discordId });

        const createdUser = await this.prismaService.$transaction(
          async (dbTransaction: DBTransaction) => {
            const user = await this.usersService.createUser(
              {
                name: username,
                discordId: discordUser.discordId,
                discordRoles: userDiscordRolesIds,
              },
              dbTransaction,
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

        const avatarFile = await this.tryLoadDiscordAvatar(discordUser);

        if (avatarFile) {
          try {
            await this.usersService.updateUserAvatar(user.id, avatarFile);
          } catch {}
        }
      } else {
        if (username) {
          throw new BadRequestException('User already exists. Please use sign in.')
        }
      }

      return this.afterLogin({
        agent,
        ip,
        userId: user.id
      });
    } catch (error) {
      this.logger.error({
        action: `Error occured on AuthDiscordService.verifyDiscord`,
        payload: {
          errorMessage: error.message,
          errorStack: error.stack,
        },
      });

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Something went wrong. Please try again later...');
    }
  }

  private async getDiscrodUserRolesIds(params: GetUserDiscordRolesParams): Promise<string[]> {
    const { discrodId } = params;

    const { guildId, botToken } = this.configService.get('discord');

    try {
      const { data: discordGuildMemberData } = await lastValueFrom(
        this.httpService.get(`${DISCORD_URI}/api/v9/guilds/${guildId}/members/${discrodId}`, {
          headers: {
            Authorization: `Bot ${botToken}`,
          },
        }),
      );
      return discordGuildMemberData.roles ?? [];
    } catch (error) {
      throw new InternalServerErrorException('Something went wrong. Please try again later...');
    }
  }

  private async getDiscordUser(params: GetUserDiscordParams): Promise<DiscordUser> {
    const { code, state, redirectUri } = params;
    const { clientId, clientSecret } = this.configService.get('discord');

    const value = await this.redisClient.get(this.getRedisKeyForToken(state), false);

    if (!value) {
      throw new BadRequestException('Invalid token');
    }

    try {
      const searchParams = new URLSearchParams();

      searchParams.append('client_id', clientId);
      searchParams.append('client_secret', clientSecret);
      searchParams.append('grant_type', 'authorization_code');
      searchParams.append('code', code);
      searchParams.append('redirect_uri', redirectUri);

      const getTokenResponse = await lastValueFrom(
        this.httpService.post(`${DISCORD_URI}/api/oauth2/token`, searchParams),
      );

      const { access_token: accessToken } = getTokenResponse.data;

      const getUserResponse = await lastValueFrom(
        this.httpService.get(`${DISCORD_URI}/api/oauth2/@me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      );

      const { data: userData } = getUserResponse;

      const discordId = userData?.user?.id;
      const username =  userData?.user?.username;
      const avatar =  userData?.user?.avatar;

      return {
        discordId,
        username,
        avatar,
      }
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }
  }

  private getRedisKeyForToken(state: string) {
    return `oauthToken:discord:${state}`;
  }

  private generateDiscordAuthUri(state: string, redirectUri: string) {
    const { clientId, scope } = this.configService.get('discord');

    const authUri = new URL(`${DISCORD_URI}/oauth2/authorize`);

    authUri.searchParams.append('response_type', 'code');
    authUri.searchParams.append('client_id', clientId);
    authUri.searchParams.append('scope', scope);
    authUri.searchParams.append(
      'redirect_uri',
      redirectUri,
    );
    authUri.searchParams.append('state', state);

    return authUri.toString();
  }
}
