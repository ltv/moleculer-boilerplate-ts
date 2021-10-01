import { Profile } from '@prisma/client'
import admin from 'firebase-admin'
import { ClientRequest } from 'http'
import { Context, Errors, GenericObject, ServiceSchema, ServiceSettingSchema } from 'moleculer'

const { MoleculerError } = Errors
type AuthRequest = ClientRequest & { headers: GenericObject }

export const FirebaseAuthMixin: ServiceSchema<ServiceSettingSchema> = {
  name: null,
  settings: {},
  actions: {},
  methods: {
    init() {
      if (!admin.apps.length) {
        admin.initializeApp()
      }
    },
    /**
     * Authenticate the request
     *
     * @param {Context} ctx
     * @param {Object} route
     * @param {IncomingRequest} req
     * @returns {Promise}
     */
    async authenticate(ctx: Context<unknown, AppMeta>,_: unknown,req: AuthRequest) {
      this.logger.info('Authenticating...')
      let token

      // Get JWT token from Authorization header
      const auth = req.headers['authorization']
      if (auth && auth.startsWith('Bearer ')) {
        token = auth.slice(7)
      }

      if (!token) {
        throw new MoleculerError('Invalid Token', 401, 'INVALID_TOKEN')
      }

      const user: Profile = await this.verifyJWTToken(token)
      if (!user || !user.userId) {
        return
      }
      ctx.meta.token = token

      ctx.emit('auth.resolvedToken', user)
      this.setMeta(ctx, { userId: user.userId })

      return ctx.meta.user
    },

    async verifyJWTToken(token: string): Promise<Profile> {
      try {
        const decoded: admin.auth.DecodedIdToken = await admin.auth().verifyIdToken(token)
        return {
          userId: decoded.uid,
          displayName: decoded.name,
          photoUrl: decoded.picture,
          email: decoded.email,
        } as Profile
      } catch (err) {
        this.logger.error(err.message)
        throw new MoleculerError('Token has expired', 401, 'TOKEN_EXPIRED')
      }
    },

    setMeta(ctx: Context<unknown, AppMeta<Profile>>, user: Profile) {
      ctx.meta.userId = user.userId
      ctx.meta.user = user
    },
  },
  created() {
    this.init()
  },
}
