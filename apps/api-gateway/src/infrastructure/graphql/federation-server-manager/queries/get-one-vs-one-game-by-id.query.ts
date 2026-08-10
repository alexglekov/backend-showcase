import { USER_GRAPHQL_FIELDS } from './get-user-by-id.query';

export const GET_ONE_VS_ONE_GAME_BY_ID_GRAHQL_QUERY = `
  query getOneVsOneGameById($id: String!) {
    getOneVsOneGame(id: $id) {
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
      ownerId
      opponentId
      isPrivate
      isExact
      direction
      ownerBet {
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
      opponentBet {
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
`;
