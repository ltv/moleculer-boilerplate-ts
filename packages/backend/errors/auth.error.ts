import { BaseError, ErrorMessage, IError } from '@ltv/moleculer-core';

const AuthErrorMap: { [key: string]: IError } = {
  INVALID_TOKEN: {
    type: 'INVALID_TOKEN',
    message: 'Invalid token.',
    code: 401
  },
  EXPIRED_TOKEN: {
    type: 'EXPIRED_TOKEN',
    message: 'Token has expired.',
    code: 401
  }
};

export class AuthError extends BaseError {
  constructor(message: string, code: number, type: string) {
    super(message, code, type);
    this.name = 'AuthError';
  }

  public static invalidToken(message?: ErrorMessage): AuthError {
    return this.createError(AuthErrorMap.INVALID_TOKEN, message);
  }

  public static tokenHasExpired(message?: ErrorMessage): AuthError {
    return this.createError(AuthErrorMap.EXPIRED_TOKEN, message);
  }
}
