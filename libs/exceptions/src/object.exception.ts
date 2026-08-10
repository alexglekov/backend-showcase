import { ExceptionBase } from './exception.base';

export class ObjectException extends ExceptionBase {
  override code: number;

  constructor(message: string, code: number, stack: string, metadata?: any | undefined) {
    super(message, metadata);

    if (stack) {
      this.stack = stack;
    }

    this.code = code;
  }
}
