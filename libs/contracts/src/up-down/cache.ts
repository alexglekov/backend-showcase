export const UP_DOWN_GAME_CACHE_TTL_SEC = 60;
export const UP_DOWN_BET_CACHE_TTL_SEC = 60;

export const getUpDownGameCacheKey = (gameId: string) => `upDownGame:${gameId}`;
export const getCurrentUpDownGameIdCacheKey = () => `upDownGame:current`;
export const getUpDownBetCacheKey = (gameId: string, betId: string) => `upDownGame:${gameId}:bet:${betId}`;
export const getUpDownBetsMatchPattern = (gameId: string) => `upDownGame:${gameId}:bet:*`;
