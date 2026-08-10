import { TwitterConfig } from './twitter-config.type';

export const loadTwitterConfig = (): TwitterConfig => {
  return {
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      bearerToken: process.env.TWITTER_BEARER_TOKEN!,
    },
  };
};
