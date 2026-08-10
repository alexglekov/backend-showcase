import { USER_GRAPHQL_FIELDS } from './get-user-by-id.query';

export const GET_NOTIFICATION_BY_ID_GRAHQL_QUERY = `
  query getNotificationById($id: String!) {
    getNotificationById(id: $id) {
      __typename
      ... on HotNotification {
        __typename
        createdAt
        id
        isRead
        type
        updatedAt
        userId
      }
      ... on MentionNotification {
        __typename
        createdAt
        id
        isRead
        messageId
        type
        userId
      }
      ... on GameResultNotification {
        __typename
        createdAt
        id
        isRead
        type
        userId
        payload {
          __typename
          ... on UpDownGameResultNotificationPayload {
            __typename
            amount
            gameType
            outcome
            status
          }
          ... on SetupGameResultNotificationPayload {
            __typename
            amount
            gameType
            outcome
            status
          }
          ... on OneVsOneUpDownGameResultNotificationPayload {
            __typename
            amount
            gameSubtype
            gameType
            outcome
            status
            opponent {
              ${USER_GRAPHQL_FIELDS}
            }
          }
          ... on OneVsOneExactPriceGameResultNotificationPayload {
            __typename
            amount
            gameSubtype
            gameType
            outcome
            status
            opponent {
              ${USER_GRAPHQL_FIELDS}
            }
          }
          ... on BullseyeGameResultNotificationPayload {
            __typename
            amount
            gameType
            isExact
            outcome
            status
            winnerOutcome
            winner {
              ${USER_GRAPHQL_FIELDS}
            }
          }
        }
      }
    }
  }
`;
