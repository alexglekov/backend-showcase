export interface JwtConfig {
  jwt: {
    refreshTokenSecret: string;
    refreshTokenExpiresAt: number;
    accessTokenSecret: string;
    sessionExpiresAt: number;
  };
}
