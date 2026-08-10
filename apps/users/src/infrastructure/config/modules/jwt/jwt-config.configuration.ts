import { JwtConfig } from './jwt-config.type';

export const loadJwtConfig = (): JwtConfig => {
  return {
    jwt: {
      refreshTokenSecret: process.env.JWT_SECRET!,
      refreshTokenExpiresAt: 2592000,
      accessTokenSecret: process.env.JWT_SECRET!,
      recoveryPasswordTokenSecret: process.env.JWT_SECRET!,
      sessionExpiresAt: 43200,
    },
  };
};
