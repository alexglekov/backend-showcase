import { USER_GRAPHQL_FIELDS } from './get-user-by-id.query';

export const GET_UP_DOWN_GAME_BY_ID_GRAHQL_QUERY = `
  query getUpDownGameById($gameId: String!) {
    getUpDownGameCached(gameId: $gameId) {
      __typename
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
      isUp
      upPool {
        __typename
        betsCount
        poolAmount
        bets {
          __typename
          id
          gameType
          gameId
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
            ${USER_GRAPHQL_FIELDS}
          } 
        }
      } 
      downPool {
        __typename
        betsCount
        poolAmount
        bets {
          __typename
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
            ${USER_GRAPHQL_FIELDS}
          } 
        }
      } 
    }
  }
`;
