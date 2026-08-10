export const pubSubEventsNames = {
  upDown: {
    state: 'up-down-game-state',
  },
  analytics: {
    luckyBets: 'analytics-lucky-bets',
    highWagerBets: 'analytics-high-wager-bets',
    highestPnlBets: 'analytics-highest-pnl-bets',
    userSeasonState: (userId: string) => `analytics-user-${userId}-season-state`,
  },
  notifications: {
    created: (userId: string) => `${userId}-notifications`,
  },
  payments: {
    orderUpdated: (userId: string) => `${userId}-payment-order-state-changed`,
  },
  x1000: {
    state: (userId: string) => `${userId}-x1000-game-state-changed`,
    publicGames:`x1000-public-games-states-changed`,
  },
  oneVsOne: {
    state: (gameId: string) => `one-vs-one-game-${gameId}-state`,
    createdGame: 'one-vs-one-created-game',
  },
  setup: {
    state: (gameId: string) => `setup-game-${gameId}-state`,
    createdGames: 'created-setup-games',
  },
  rooms: {
    roomMessages: (roomId: string) => `room-${roomId}-messages`
  },
  bullsEye: {
    state: 'bulls-eye-game-state',
  },
  prices: {
    assetPriceChanged: (assetId: string) => `asset-${assetId}-price-changed`
  },
  common: {
    balanceUpdated: (userId: string) => `account-${userId}-balance-changed`,
    rewardUpdated: (userId: string) => `user-${userId}-reward-changed`,
    onlineCount: 'online-count',
  }
}