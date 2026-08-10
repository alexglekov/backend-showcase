export const USER_GRAPHQL_FIELDS = `
  id
  email
  name
  bio
  avatarKeys
  avatarUris
  discordRoles
  isInfluencer
  updatedAt
  createdAt
  __typename
`

export const GET_USER_BY_ID_GRAHQL_QUERY = `
  query getUserBy($data: FindUserInput!) {
    getUserBy(data: $data) {
      ${USER_GRAPHQL_FIELDS}
    }
  }
`;
