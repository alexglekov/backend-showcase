export interface AuthProvidersConfig {
  twitter: {
    tokenExpiresAt: number;
  };
  metamask: {
    challengeExpiresAt: number;
  }
  discord: {
    tokenExpiresAt: number;
    scope: string;
    clientId: string;
    clientSecret: string;
    alphaTestersRoleId: string;
    botToken: string;
    guildId: string;
    xyroClanRoleId: string;
  };
}
