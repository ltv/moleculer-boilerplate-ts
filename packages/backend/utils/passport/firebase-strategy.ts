import { IncomingMessage } from 'http';
import admin from 'firebase-admin';

export interface FirebaseStrategyOptions {
  callbackURL: string;
  scope: string;
  scopeSeparator: string;
  authorizationURL: string;
  projectId: string;
  verify: (
    accessToken: string,
    refreshToken: string,
    decodedToken: any,
    callback: (err: Error) => void
  ) => void;
}

export default class FirebaseStrategy {
  public name: string;
  private projectId: string;
  private callbackURL!: string;
  private scope: string = 'profile email';
  private scopeSeparator: string = ' ';
  private authorizationURL!: string;
  private firebaseIssuer!: string;

  private verify!: (
    accessToken: string,
    refreshToken: string,
    decodedToken: any,
    callback: (err: Error) => void
  ) => void;

  constructor(options: FirebaseStrategyOptions, verify: () => void) {
    if (!verify) {
      throw new TypeError('FirebaseStrategy requires a verify callback');
    }
    if (!options.authorizationURL) {
      throw new TypeError('FirebaseStrategy requires a authorizationURL option');
    }
    if (!options.projectId) {
      throw new TypeError('FirebaseStrategy requires a project id');
    }
    this.name = 'firebase';
    this.projectId = options.projectId;
    this.callbackURL = options.callbackURL;
    this.scope = options.scope;
    this.scopeSeparator = options.scopeSeparator;
    this.firebaseIssuer = `https://securetoken.google.com/${options.projectId}`;
    this.verify = options.verify;
  }
  /**
   * Authenticate request.
   *
   * This function must be overridden by subclasses.  In abstract form, it always
   * throws an exception.
   *
   * @param {Object} req The request to authenticate.
   * @param {Object} [options] Strategy-specific options.
   * @api public
   */
  public authenticate(req: IncomingMessage, options: any) {}

  public authorizationParams() {
    return {};
  }
}
