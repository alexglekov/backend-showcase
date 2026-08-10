import { USER_GRAPHQL_FIELDS } from './get-user-by-id.query';

export const GET_SETUP_GAME_BY_ID_GRAHQL_QUERY = `
  query getSetupGameById($id: String!) {
    getSetupGame(id: $id) {
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
      ownerId
      owner {
        ${USER_GRAPHQL_FIELDS}
      }
      isLong
      takeProfit
      stopLoss
      takeProfitPool {
        __typename
        amount
        count
        multiplier
      }
      stopLossPool {
        __typename
        amount
        count
        multiplier
      }
      isTrusted
    }
  }
`;
