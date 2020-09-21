import { Context } from '@app/types';
import { AuthSpecialRole } from '@ltv/moleculer-core';
import { User } from '@prisma/client';
import { AuthError } from 'errors';
import admin from 'firebase-admin';
import { ClientRequest } from 'http';
import { GenericObject, ServiceSchema, ServiceSettingSchema } from 'moleculer';
import { SVC_USER_DB } from 'utils/constants';

export const FirebaseAuthMixin: ServiceSchema<ServiceSettingSchema> = {
  name: null,
  actions: {
    session: {
      handler(ctx: Context) {
        return ctx.meta.user;
      }
    },
    createUser: {
      async handler(ctx: Context<User>) {
        const user = await ctx.call(`${SVC_USER_DB}.findById`, { id: ctx.params.id });
        if (user) {
          return user;
        }
        return ctx.call(`${SVC_USER_DB}.createUserWithProfile`, ctx.params);
      }
    }
  },
  methods: {
    init() {
      if (!admin.apps.length) {
        admin.initializeApp();
      }
      this.settings.routes.unshift({
        path: '/api/v1/auth',
        authentication: true,
        aliases: {
          'GET /session': `${this.fullName}.session`,
          'POST /register': `${this.fullName}.createUser`
        },
        mappingPolicy: 'restrict',
        bodyParsers: {
          json: true,
          urlencoded: { extended: true }
        }
      });
    },
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

      if (token) {
        const decoded: User = await this.verifyJWTToken(token);
        if (decoded) {
          ctx.meta.token = token;
          ctx.meta.roles = [AuthSpecialRole.EVERYONE];

          this.setMeta(ctx, decoded);

          return ctx.meta.user;
        }
        return undefined;
      }
      return AuthError.invalidToken().reject();
    },
    async verifyJWTToken(token: string): Promise<User> {
      const decoded: admin.auth.DecodedIdToken = await admin.auth().verifyIdToken(token);
      if (!decoded || !decoded.uid) {
        return AuthError.invalidToken().reject();
      }

      const exp = decoded.exp * 1000;
      const expired = exp - Date.now() < 0;

      if (expired) {
        return AuthError.tokenHasExpired().reject();
      }

      return {
        id: decoded.uid,
        name: decoded.name,
        username: decoded.email,
        email: decoded.email,
        avatarUrl: decoded.picture,
        createdAt: null,
        updatedAt: null
      };
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
  },
  created() {
    this.init();
  }
};
