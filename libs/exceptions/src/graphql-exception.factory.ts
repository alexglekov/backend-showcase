import { GraphQLError } from 'graphql';

import { ExceptionBase } from './exception.base';

export class GraphQLExceptionFactory {
  static getException(error: ExceptionBase): GraphQLError {
    const json = error.toJSON();

    return new GraphQLError(json.message, {
      extensions: json as any,
    });
  }
}
