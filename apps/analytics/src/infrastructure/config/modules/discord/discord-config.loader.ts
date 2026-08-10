import { DiscordConfig } from './discord-config.type';

export const loadDiscordConfig = (): DiscordConfig => {
  return {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      botToken: process.env.DISCORD_BOT_TOKEN!,
      guildId: process.env.DISCORD_GUILD_ID!,
    },
  };
};
