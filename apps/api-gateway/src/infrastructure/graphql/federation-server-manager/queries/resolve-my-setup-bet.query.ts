export const RESOLVE_MY_SETUP_BET_GRAHQL_QUERY = `
  query resolveMySetupBet($gameId: String!) {
    resolveMySetupBet(gameId: $gameId) {
      id
      gameId
      gameType
      ownerId
      type
      amount
      fee
      pnl
      result
      outcome
      price
      isUp
      priceResult
      isUpResult
      createdAt
      updatedAt
      multiplier
      owner {
        id
        email
        bio
        name
        avatarKeys
        discordRoles
        isInfluencer
        createdAt
        updatedAt
        avatarUris
      }
    }
  }
`;
