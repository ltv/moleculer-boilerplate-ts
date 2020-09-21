import { AuthError } from 'errors';
import fs from 'fs';
import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { GenericObject } from 'moleculer';
import path from 'path';

const ROOT_PATH = process.cwd();
const { JWT_PUBLIC_KEY_PATH, JWT_PRIVATE_KEY_PATH, JWT_SECRET } = process.env;

function readKeyContent(keyPath: string) {
  return fs.readFileSync(keyPath, 'utf8');
}

/**
 * Sign JWT Key with Public & Private Key
 *
 * @param type string refreshToken || undefined
 * @param payload GenericObject
 * @param expiredIn expressed in seconds or a string describing a time span zeit/ms.
 */
export function signJWTToken(
  payload: GenericObject,
  expiresIn: string,
  options?: SignOptions
): string {
  const privateKEY: string = ((jwtSecret) => {
    if (jwtSecret) {
      return jwtSecret;
    }

    if (!JWT_PRIVATE_KEY_PATH) {
      throw Error(`'JWT_PRIVATE_KEY_PATH' is invalid. It should be defined.`);
    }

    const keyPath = ((privKeyPath) => {
      if (path.isAbsolute(privKeyPath)) {
        return privKeyPath;
      }
      return path.resolve(ROOT_PATH, privKeyPath);
    })(JWT_PRIVATE_KEY_PATH);

    return readKeyContent(keyPath);
  })(JWT_SECRET);

  const signOptions: SignOptions = {
    algorithm: 'RS256',
    ...options,
    expiresIn
  };

  return jwt.sign(payload, privateKEY, signOptions);
}

function getPublicKey(): string {
  if (JWT_SECRET) {
    return JWT_SECRET;
  }

  if (!JWT_PUBLIC_KEY_PATH) {
    throw Error(`'JWT_PUBLIC_KEY_PATH' is invalid. It should be defined.`);
  }

  const keyPath = ((pubKeyPath) => {
    if (path.isAbsolute(pubKeyPath)) {
      return pubKeyPath;
    }
    return path.resolve(ROOT_PATH, pubKeyPath);
  })(JWT_PUBLIC_KEY_PATH);

  return readKeyContent(keyPath);
}

function getVerifyOptions(options?: SignOptions): VerifyOptions {
  return {
    algorithms: ['RS256'],
    ...options
  };
}

/**
 * Verify a JWT token and return the decoded payload
 *
 * @param {String} token
 */
export function verifyJWT(token: string, publicKEY?: string, options?: SignOptions) {
  if (!publicKEY) {
    publicKEY = getPublicKey();
  }

  const verifyOptions = getVerifyOptions(options);

  try {
    return Promise.resolve(jwt.verify(token, publicKEY, verifyOptions));
  } catch (err) {
    return AuthError.invalidToken({ message: err.message }).reject();
  }
}

export function decode(token: string) {
  return jwt.decode(token, { complete: true });
}
