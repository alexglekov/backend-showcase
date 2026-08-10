export const GET_PAYMENT_ORDER_BY_ID_GRAHQL_QUERY = `
  query getPaymentOrderById($id: String!) {
    getPaymentOrder(id: $id) {
      id
      status
      type
      ownerId
      cancelReason
      transactionId
      transaction {
        id
        foreignId
        paymentSystem
        transactionHash
        confirmations
        status
        type
        error
        currency
        amount
        originalAmount
        address
        platformFee
        networkFee
        createdAt
        __typename
      }
      __typename
    }
  }
`;
