export const BULLS_EYE_GAME_CACHE_TTL_SEC = 140;
export const BULLS_EYE_BET_CACHE_TTL_SEC = 140;

export const getBullsEyeGameCacheKey = (gameId: string) => `bullsEyeGame:${gameId}`;
export const getCurrentBullsEyeGameIdCacheKey = () => `bullsEyeGame:current`;
export const getBullsEyeBetCacheKey = (gameId: string, betId: string) => `bullsEyeGame:${gameId}:bet:${betId}`;
export const getBullsEyeBetsMatchPattern = (gameId: string) => `bullsEyeGame:${gameId}:bet:*`;
