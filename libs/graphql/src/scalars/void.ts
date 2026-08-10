import { CustomScalar, Scalar } from '@nestjs/graphql';

export class Void extends Boolean {};

@Scalar('Void', () => Void)
export class VoidScalar implements CustomScalar<boolean, boolean> {
  public description = 'Represents NULL values';

  serialize() {
    return true
  };

  parseValue() {
    return true
  };

  parseLiteral() {
    return true
  }
}

