import { GameConfig } from './game-config.type';

export const loadGameConfig = (): GameConfig => {
  return {
    game: {
      assetId: 'BTC',
      maxBetAmount: 1000,
    }
  };
};
