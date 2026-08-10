export interface SerializedException {
  code: number;
  message: string;
  metadata?: string;
  stack?: string;
}

/**
 * Base class for custom exceptions.
 *
 * @abstract
 * @class ExceptionBase
 * @extends {Error}
 */
export abstract class ExceptionBase extends Error {
  /**
   * @param {string} message
   * @param {ObjectLiteral} [metadata={}]
   * **BE CAREFUL** not to include sensitive info in 'metadata'
   * to prevent leaks since all exception's data will end up
   * in application's log files. Only include non-sensitive
   * info that may help with debugging.
   */
  constructor(
    override readonly message: string,
    readonly metadata?: unknown
  ) {
    super(message);
  }

  abstract code: number;

  override toString() {
    return JSON.stringify({
      message: this.message,
      code: this.code,
      stack: this.stack,
      metadata: JSON.stringify(this.metadata),
    });
  }

  toJSON(): SerializedException {
    return {
      message: this.message,
      code: this.code,
      stack: this.stack,
      metadata: JSON.stringify(this.metadata),
    };
  }
}
