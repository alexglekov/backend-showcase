import { BadRequestException } from '@nestjs/common';
import { Scalar, CustomScalar } from '@nestjs/graphql';
import { ValueNode, Kind } from 'graphql';

@Scalar('Timestamp', (type) => Date)
export class DateScalar implements CustomScalar<number, Date> {
  description = 'Date custom scalar type';

  parseValue(value: unknown): Date {
    return new Date(value as any); // value from the client
  }

  serialize(value: unknown): number {
    return new Date(value as any).getTime(); // value sent to the client
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.INT) {
      return new Date(ast.value);
    }

    throw new BadRequestException('Value is not Date');
  }
}
