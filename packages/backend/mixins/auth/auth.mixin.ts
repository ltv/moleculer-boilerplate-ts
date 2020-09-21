import { Context } from '@app/types';
import { AuthSpecialRole } from '@ltv/moleculer-core';
import { User } from '@prisma/client';
import { AuthError } from 'errors';
import { ClientRequest } from 'http';
import { GenericObject, ServiceSchema, ServiceSettingSchema } from 'moleculer';
import { verifyJWT } from 'utils';
import { SVC_TOKEN } from 'utils/constants';

export interface JWTDecoded {
  id: string;
  expired: boolean;
}

const AuthMixin: ServiceSchema<ServiceSettingSchema> = {
  name: null,
  methods: {
    /**
     * Authenticate the request
     *
     * @param {Context} ctx
     * @param {Object} route
     * @param {IncomingRequest} req
     * @returns {Promise}
     */
    async authenticate(ctx: Context, _: any, req: ClientRequest & { headers: GenericObject }) {
      this.logger.info('Authenticating...');
      let token;

      // Get JWT token from Authorization header
      if (!token) {
        const auth = req.headers['authorization'];
        if (auth && auth.startsWith('Bearer ')) token = auth.slice(7);
      }

      ctx.meta.roles = [AuthSpecialRole.EVERYONE];

      if (token) {
        const decoded = await this.verifyJWTToken(token);
        if (decoded) {
          ctx.meta.token = token;

          this.setMeta(ctx, null);

          return ctx.meta.user;
        }
        return undefined;
      }
      return AuthError.invalidToken().reject();
    },

    async verifyJWTToken(token: string): Promise<JWTDecoded> {
      const decoded: any = await verifyJWT(token);
      if (!decoded.user) {
        return AuthError.invalidToken().reject();
      }
      const userId = decoded.user.id;
      const foundToken = await this.broker.call(`${SVC_TOKEN}.findToken`, {
        userId,
        token
      });

      if (!foundToken || !decoded.exp) {
        return AuthError.tokenHasExpired().reject();
      }

      const exp = (decoded.exp as number) * 1000;
      const expired = exp - Date.now() < 0;

      if (expired) {
        return AuthError.tokenHasExpired().reject();
      }

      return { id: decoded.user.id, expired };
    },

    setMeta(ctx: Context, user: User) {
      if (!user) {
        return;
      }
      ctx.meta.user = user;
      ctx.meta.userId = user.id;
      // ctx.meta.roles = [...ctx.meta.roles, user.role];
      ctx.meta.tenantId = `1`; // temporary fixed
    }
  }
};

export default AuthMixin;
