import { Environment } from '@xyro/core';

import { AirdropsConfig } from './airdrops-config.type';

export const loadAirdropsConfig = (): AirdropsConfig => {
  return {
    airdrops: {
      secretKey: process.env.TELEGRAM_REWARDS_BOT_SECRET_KEY!,
    },
  };
};
