import { Environment } from '@xyro/core'

export interface WalletConfig {
  wallet: {
    platformAsset: string,
    coinsPaidSecretKey: string;
    coinsPaidKey: string;
    coinsPaidBaseUrl: string;
  };
}
