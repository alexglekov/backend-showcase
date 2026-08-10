import { USER_GRAPHQL_FIELDS } from './get-user-by-id.query';

export const GET_MESSAGE_BY_ID_GRAHQL_QUERY = `
  query getMessageById($id: String!) {
    getMessageById(id: $id) {
      __typename
      id
      text
      roomId
      createdAt
      tagList
      sender {
        ${USER_GRAPHQL_FIELDS}
      }
      replyTo {
        __typename
        id
        text
        sender {
          ${USER_GRAPHQL_FIELDS}
        }
        roomId
        createdAt
      }
    }
  }
`;
