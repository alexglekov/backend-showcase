import { BadRequestException } from '@nestjs/common';
import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';


export class Markdown extends String {}

@Scalar('Markdown', () => Markdown)
export class MarkdownScalar implements CustomScalar<string, string> {
  description = 'Markdown custom scalar type';

  parseValue(value: unknown): string {
    return value as any;
  }

  serialize(value: unknown): string {
    return value as any;
  }

  parseLiteral(ast: ValueNode): string {
    if (ast.kind === Kind.STRING) {
      return ast.value;
    }
    throw new BadRequestException('Invalid Markdown format.');
  }
}
