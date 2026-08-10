import { USER_GRAPHQL_FIELDS } from './get-user-by-id.query';

export const GET_BULLS_EYE_GAME_BY_ID_GRAHQL_QUERY = `
  query getBullEyeGameById($gameId: String!) {
    getBullsEyeGameCached(gameId: $gameId) {
      id
      type
      assetId
      startAt
      stopBetsAt
      endAt
      startPrice
      endPrice
      timeframe
      state
      winnerBetId
      amount
      pool {
        betsCount
        poolAmount
      }
      bets {
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
        isExact
        place
        owner {
          ${USER_GRAPHQL_FIELDS}
        }
      }
      winnerBet {
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
        isExact
        place
        owner {
          ${USER_GRAPHQL_FIELDS}
        }
      }
    }
  }
`;
