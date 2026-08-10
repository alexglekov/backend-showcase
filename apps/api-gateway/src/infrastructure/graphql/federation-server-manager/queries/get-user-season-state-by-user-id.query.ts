export const GET_USER_SEASON_STATE_BY_USER_ID_GRAHQL_QUERY = `
  query getUserSeasonStateByUserId($userId: String!) {
    getUserSeasonStateByUserId(userId: $userId) {
      id
      name
      description
      __typename
      challenges {
        id
        name
        description
        number
        __typename
        tasks {
          id
          name
          description
          number
          reward
          __typename
          userRelatedTask {
            id
            status
            __typename
          }
        }
      }
    }
  }
`;
