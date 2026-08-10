import { WalletConfig } from './wallet-config.type';

export const loadWalletConfig = (): WalletConfig => {
  return {
    wallet: {
      platformAsset: 'USDTE',
      coinsPaidSecretKey: process.env.COINS_PAID_SECRET_KEY!,
      coinsPaidBaseUrl: process.env.COINS_PAID_BASE_URL!,
      coinsPaidKey: process.env.COINS_PAID_KEY!,
    },
  };
};
