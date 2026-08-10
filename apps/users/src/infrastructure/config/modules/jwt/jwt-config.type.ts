export interface JwtConfig {
  jwt: {
    refreshTokenSecret: string;
    refreshTokenExpiresAt: number;
    recoveryPasswordTokenSecret: string;
    accessTokenSecret: string;
    sessionExpiresAt: number;
  };
}
