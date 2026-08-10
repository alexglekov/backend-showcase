import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@xyro/libs/redis';
import { REST, RESTGetAPIGuildMemberResult, Routes } from 'discord.js';

import { Config } from '../../../infrastructure/config';

interface DiscrodAccount {
  id: string;
  name: string;
  roles: string[];
}

const MAX_ACCOUNT_CACHE_TTL_SECONDS = 180

@Injectable()
export class DiscordService {
  private client: REST;
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService<Config>,
  ) {
    this.client = new REST({
      version: '10',
      authPrefix: 'Bot',
    });

    const { botToken } = this.configService.get('discord');

    this.client.setToken(botToken);
  }

  async getAccountById(discordId: string): Promise<DiscrodAccount> {
    const accountCacheKey = `discordAccount:${discordId}`;

    const cachedData = await this.redisService.get<DiscrodAccount>(accountCacheKey);

    if (cachedData) return cachedData;

    const { guildId } = this.configService.get('discord');

    const discordAccount = await this.client.get(Routes.guildMember(guildId, discordId)) as RESTGetAPIGuildMemberResult;

    if (!discordAccount) throw new BadRequestException(`Discord Account not found by ID <${discordId}>`);

    const dataToCache: DiscrodAccount = {
      id: discordId,
      name:  discordAccount.user?.global_name
        || discordAccount.user?.username
        || discordAccount.nick
        || 'No name',
      roles: discordAccount.roles ?? [],
    };

    await this.redisService.set(accountCacheKey, dataToCache, { expiresInSeconds: MAX_ACCOUNT_CACHE_TTL_SECONDS, });

    return dataToCache;
  }
}
