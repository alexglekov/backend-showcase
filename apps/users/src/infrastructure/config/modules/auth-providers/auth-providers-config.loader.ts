import { Environment } from '@xyro/core';

import { AuthProvidersConfig } from './auth-providers-config.type';

export const loadAuthProvidersConfig = (): AuthProvidersConfig => {
  return {
    twitter: {
      tokenExpiresAt: 24 * 60,
    },
    metamask: {
      challengeExpiresAt: 24 * 60 * 60,
    },
    discord: {
      scope: 'identify',
      tokenExpiresAt: 24 * 60,
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      botToken: process.env.DISCORD_BOT_TOKEN!,
      guildId: process.env.DISCORD_GUILD_ID!,
      alphaTestersRoleId: '1194274222776782909',
      xyroClanRoleId: '1194329775511195719',
    },
  };
};
