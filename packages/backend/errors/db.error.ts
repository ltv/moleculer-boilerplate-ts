import { BaseError, ErrorMessage, IError } from '@ltv/moleculer-core';

const DatabaseErrorMap: { [key: string]: IError } = {
  RECORD_NOTFOUND: {
    type: 'RECORD_NOTFOUND',
    message: 'Record not found.',
    code: 404
  },
  INVALID_INVOCATION: {
    type: 'INVALID_INVOCATION',
    message: 'Invalid invocation.',
    code: 401
  }
};

export class DatabaseError extends BaseError {
  constructor(message: string, code: number, type: string) {
    super(message, code, type);
    this.name = 'DatabaseError';
  }

  public static notFound(message?: ErrorMessage): DatabaseError {
    return this.createError(DatabaseErrorMap.RECORD_NOTFOUND, message);
  }

  public static invalidInvocation(message?: ErrorMessage): DatabaseError {
    return this.createError(DatabaseErrorMap.INVALID_INVOCATION, message);
  }
}
