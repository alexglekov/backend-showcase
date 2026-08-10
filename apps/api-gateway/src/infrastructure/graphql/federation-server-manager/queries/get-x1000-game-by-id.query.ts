import { USER_GRAPHQL_FIELDS } from './get-user-by-id.query';

export const GET_X1000_GAME_BY_ID_GRAHQL_QUERY = `
  query getX1000GameById($id: String!) {
    getX1000Game(id: $id) {
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
      bet {
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
        isLong
        takeProfit
        stopLoss
        burnPrice
        feeType
        roi
        owner {
          ${USER_GRAPHQL_FIELDS}
        }
      }
    }
  }
`;
